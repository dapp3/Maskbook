export const is = (x: any) => x instanceof Response
export const serializer = (x: Response) => {
    return {
        body: x.body,
        init: {
            status: x.status,
            statusText: x.statusText,
            headers: x.headers,
        },
    }
}

export const deserializer = (x: { body: Uint8Array[]; init: ResponseInit }) => {
    const body = new ReadableStream({
        start(controller) {
            for (const binary of x.body) {
                controller.enqueue(binary)
            }
            controller.close()
        },
    })
    return new Response(body, x.init)
}

export const responseRegedit = [is, serializer, deserializer] as const
