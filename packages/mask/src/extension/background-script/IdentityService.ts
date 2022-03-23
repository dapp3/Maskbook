import * as bip39 from 'bip39'
import { validateMnemonic } from 'bip39'
import { decode } from '@msgpack/msgpack'
import { decodeArrayBuffer, decodeText } from '@dimensiondev/kit'
import {
    loginPersona,
    personaRecordToPersona,
    queryAvatarDataURL,
    queryPersona,
    queryPostPagedDB,
    queryProfile,
    queryProfilesWithQuery,
    storeAvatar,
} from '../../database'
import {
    ECKeyIdentifier,
    Identifier,
    PersonaIdentifier,
    ProfileIdentifier,
    ECKeyIdentifierFromJsonWebKey,
    EC_JsonWebKey,
    PersonaInformation,
    ProfileInformation,
    PostIVIdentifier,
    RelationFavor,
} from '@masknet/shared-base'
import type { Persona, Profile } from '../../database/Persona/types'
import {
    attachProfileDB,
    consistentPersonaDBWriteAccess,
    createOrUpdateProfileDB,
    createProfileDB,
    createRelationDB,
    createRelationsTransaction,
    deleteProfileDB,
    queryPersonaDB,
    queryPersonasDB,
    queryProfilesDB,
    queryRelationsPagedDB,
    updateRelationDB,
    ProfileRecord,
    LinkedProfileDetails,
    RelationRecord,
} from '../../../background/database/persona/db'
import {
    queryPersonasDB as queryPersonasFromIndexedDB,
    queryProfilesDB as queryProfilesFromIndexedDB,
    queryRelations as queryRelationsFromIndexedDB,
} from '../../../background/database/persona/web'
import { BackupJSONFileLatest, UpgradeBackupJSONFile } from '../../utils/type-transform/BackupFormat/JSON/latest'
import { restoreBackup } from './WelcomeServices/restoreBackup'
import { restoreNewIdentityWithMnemonicWord } from './WelcomeService'
import { convertBackupFileToObject, fixBackupFilePermission } from '../../utils/type-transform/BackupFile'

import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { getCurrentPersonaIdentifier } from './SettingsService'
import { MaskMessages } from '../../utils'
import { first, orderBy } from 'lodash-unified'
import { recover_ECDH_256k1_KeyPair_ByMnemonicWord } from '../../utils/mnemonic-code'

assertEnvironment(Environment.ManifestBackground)

export { validateMnemonic } from '../../utils/mnemonic-code'
export * from '../../../background/services/identity'

// #region Profile
export { queryProfile, queryProfilePaged, queryPersonaByProfile } from '../../database'

export function queryProfiles(network?: string): Promise<Profile[]> {
    return queryProfilesWithQuery({ network })
}

export async function queryProfileRecordFromIndexedDB() {
    return queryProfilesFromIndexedDB({})
}

export function queryProfilesWithIdentifiers(identifiers: ProfileIdentifier[]) {
    return queryProfilesWithQuery({ identifiers })
}
export async function queryMyProfiles(network?: string): Promise<Profile[]> {
    const myPersonas = (await queryMyPersonas(network)).filter((x) => !x.uninitialized)
    return Promise.all(
        myPersonas
            .flatMap((x) => Array.from(x.linkedProfiles.keys()))
            .filter((y) => !network || network === y.network)
            .map(queryProfile),
    )
}
export async function updateProfileInfo(
    identifier: ProfileIdentifier,
    data: {
        nickname?: string | null
        avatarURL?: string | null
    },
): Promise<void> {
    if (data.nickname) {
        const rec: ProfileRecord = {
            identifier,
            nickname: data.nickname,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await consistentPersonaDBWriteAccess((t) => createOrUpdateProfileDB(rec, t))
    }
    if (data.avatarURL) await storeAvatar(identifier, data.avatarURL)
}
export function removeProfile(id: ProfileIdentifier): Promise<void> {
    return consistentPersonaDBWriteAccess((t) => deleteProfileDB(id, t))
}
// #endregion

// #region Persona
export { queryPersona, createPersonaByMnemonic, createPersonaByMnemonicV2, renamePersona } from '../../database'

export async function queryPersonaByMnemonic(mnemonic: string, password: '') {
    const verify = validateMnemonic(mnemonic)
    if (!verify) {
        throw new Error('Verify error')
    }

    const { key } = await recover_ECDH_256k1_KeyPair_ByMnemonicWord(mnemonic, password)
    const identifier = ECKeyIdentifierFromJsonWebKey(key.privateKey)
    const persona = await queryPersonaDB(identifier, undefined, true)
    if (persona) {
        await loginPersona(persona.identifier)
        return persona
    }

    return null
}
export async function queryPersonas(identifier?: PersonaIdentifier, requirePrivateKey = false): Promise<Persona[]> {
    if (typeof identifier === 'undefined')
        return (await queryPersonasDB({ hasPrivateKey: requirePrivateKey })).map(personaRecordToPersona)
    const x = await queryPersonaDB(identifier)
    if (!x || (!x.privateKey && requirePrivateKey)) return []
    return [personaRecordToPersona(x)]
}

export async function queryPersonaRecordsFromIndexedDB() {
    return queryPersonasFromIndexedDB()
}

export function queryMyPersonas(network?: string): Promise<Persona[]> {
    return queryPersonas(undefined, true).then((x) =>
        typeof network === 'string'
            ? x.filter((y) => {
                  for (const z of y.linkedProfiles.keys()) {
                      if (z.network === network) return true
                  }
                  return false
              })
            : x,
    )
}

export async function queryLastPersonaCreated() {
    const all = await queryPersonas(undefined, true)
    return first(orderBy(all, (x) => x.createdAt, 'desc'))
}

export async function queryOwnedPersonaInformation(): Promise<PersonaInformation[]> {
    const personas = await queryPersonas(undefined, true)
    const result: PersonaInformation[] = []
    for (const persona of personas.sort((a, b) => (a.updatedAt > b.updatedAt ? 1 : -1))) {
        const map: ProfileInformation[] = []
        result.push({
            nickname: persona.nickname,
            identifier: persona.identifier,
            linkedProfiles: map,
            publicHexKey: persona.publicHexKey,
        })
        for (const [profile] of persona.linkedProfiles) {
            const linkedProfile = await queryProfile(profile)

            map.push({ identifier: profile, nickname: linkedProfile.nickname, avatar: linkedProfile.avatar })
        }
    }
    return result
}
export async function restoreFromObject(object: null | BackupJSONFileLatest): Promise<Persona | null> {
    if (!object) return null
    await restoreBackup(object)
    if (object?.personas?.length) {
        return queryPersona(Identifier.fromString(object.personas[0].identifier, ECKeyIdentifier).unwrap())
    }
    return null
}
export async function restoreFromMnemonicWords(
    mnemonicWords: string,
    nickname: string,
    password: string,
): Promise<Persona> {
    if (!bip39.validateMnemonic(mnemonicWords)) throw new Error('the mnemonic words are not valid')
    const identifier = await restoreNewIdentityWithMnemonicWord(mnemonicWords, password, {
        nickname,
    })

    return queryPersona(identifier)
}
export async function restoreFromBase64(base64: string): Promise<Persona | null> {
    return restoreFromObject(JSON.parse(decodeText(decodeArrayBuffer(base64))) as BackupJSONFileLatest)
}
export async function restoreFromBackup(backup: string): Promise<Persona | null> {
    return restoreFromObject(fixBackupFilePermission(UpgradeBackupJSONFile(convertBackupFileToObject(backup))))
}
// #endregion

// #region Profile & Persona
/**
 * Remove an identity.
 */
export { setupPersona, deletePersona, logoutPersona } from '../../database'
export async function attachProfile(
    source: ProfileIdentifier,
    target: ProfileIdentifier | PersonaIdentifier,
    data: LinkedProfileDetails,
): Promise<void> {
    if (target instanceof ProfileIdentifier) {
        const profile = await queryProfile(target)
        if (!profile.linkedPersona) throw new Error('target not found')
        target = profile.linkedPersona.identifier
    }
    return attachProfileDB(source, target, data)
}
export { detachProfileDB as detachProfile } from '../../../background/database/persona/db'
// #endregion

// #region Post
export { queryPostsDB } from '../../database'

export async function queryPagedPostHistory(
    options: {
        network: string
        userIds: string[]
        after?: PostIVIdentifier
        pageOffset?: number
    },
    count: number,
) {
    const currentPersona = await getCurrentPersonaIdentifier()
    if (currentPersona) {
        return queryPostPagedDB(currentPersona, options, count)
    }

    return []
}
// #endregion

// #region Relation
export async function patchCreateOrUpdateRelation(
    profiles: ProfileIdentifier[],
    personas: PersonaIdentifier[],
    defaultFavor = RelationFavor.UNCOLLECTED,
) {
    await consistentPersonaDBWriteAccess(async (t) => {
        for (const persona of personas) {
            for (const profile of profiles) {
                const relationInDB = await t.objectStore('relations').get([persona.toText(), profile.toText()])
                if (relationInDB) {
                    await updateRelationDB({ profile: profile, linked: persona, favor: defaultFavor }, t, true)
                    continue
                }
                await createRelationDB({ profile: profile, linked: persona, favor: defaultFavor }, t, true)
            }
        }
    })
    return
}

export async function patchCreateNewRelation(relations: Omit<RelationRecord, 'network'>[]) {
    await consistentPersonaDBWriteAccess(async (t) => {
        for (const relation of relations) {
            const relationInDB = await t
                .objectStore('relations')
                .get([relation.linked.toText(), relation.profile.toText()])

            if (relationInDB) {
                await updateRelationDB(relation, t, true)
                continue
            }

            await createRelationDB(
                {
                    ...relation,
                    favor: relation.favor === RelationFavor.DEPRECATED ? RelationFavor.UNCOLLECTED : relation.favor,
                },
                t,
            )
        }
    })
    return
}

export async function createNewRelation(
    profile: ProfileIdentifier,
    linked: PersonaIdentifier,
    favor = RelationFavor.UNCOLLECTED,
) {
    const t = await createRelationsTransaction()
    const relationInDB = await t.objectStore('relations').get([linked.toText(), profile.toText()])
    if (relationInDB) return

    await createRelationDB({ profile, linked, favor }, t)
}

export async function queryRelationsRecordFromIndexedDB(): Promise<RelationRecord[]> {
    return queryRelationsFromIndexedDB(() => true)
}

export async function queryRelationPaged(
    options: {
        network: string
        after?: RelationRecord
        pageOffset?: number
    },
    count: number,
): Promise<RelationRecord[]> {
    const currentPersona = await getCurrentPersonaIdentifier()
    if (currentPersona) {
        return queryRelationsPagedDB(currentPersona, options, count)
    }

    return []
}

export async function updateRelation(profile: ProfileIdentifier, linked: PersonaIdentifier, favor: RelationFavor) {
    const t = await createRelationsTransaction()
    await updateRelationDB({ profile, linked, favor }, t)
}
// #endregion
/**
 * In older version of Mask, identity is marked as `ProfileIdentifier(network, '$unknown')` or `ProfileIdentifier(network, '$self')`. After upgrading to the newer version of Mask, Mask will try to find the current user in that network and call this function to replace old identifier into a "resolved" identity.
 * @param identifier The resolved identity
 */
export async function resolveIdentity(identifier: ProfileIdentifier): Promise<void> {
    const unknown = new ProfileIdentifier(identifier.network, '$unknown')
    const self = new ProfileIdentifier(identifier.network, '$self')

    const r = await queryProfilesDB({ identifiers: [unknown, self] })
    if (!r.length) return
    const final = {
        ...r.reduce((p, c) => ({ ...p, ...c })),
        identifier,
    }
    try {
        await consistentPersonaDBWriteAccess(async (t) => {
            await createProfileDB(final, t)
            await deleteProfileDB(unknown, t).catch(() => {})
            await deleteProfileDB(self, t).catch(() => {})
        })
    } catch {
        // the profile already exists
    }
}
// #endregion

// #region avatar
export const updateCurrentPersonaAvatar = async (avatar: Blob) => {
    const identifier = await getCurrentPersonaIdentifier()

    if (identifier) {
        await storeAvatar(identifier, await avatar.arrayBuffer())
        MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
    }
}

export const getCurrentPersonaAvatar = async () => {
    const identifier = await getCurrentPersonaIdentifier()
    if (!identifier) return null

    try {
        return await queryAvatarDataURL(identifier)
    } catch {
        return null
    }
}
// #endregion

// #region Private / Public key

export async function queryPersonaByPrivateKey(privateKeyString: string) {
    const privateKey = decode(decodeArrayBuffer(privateKeyString)) as EC_JsonWebKey
    const identifier = ECKeyIdentifierFromJsonWebKey(privateKey)

    const persona = await queryPersonaDB(identifier, undefined, true)
    if (persona) {
        await loginPersona(persona.identifier)
        return personaRecordToPersona(persona)
    }

    return null
}
// #endregion
