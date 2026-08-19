const sampleContent = '[ATTACHMENT:{"url":"https://example.com/file.pdf","name":"assignment.pdf","type":"application/pdf","size":2450000}] Here is my assignment!';

function parseMessageContent(rawContent) {
    if (rawContent && rawContent.startsWith('[ATTACHMENT:')) {
        const endIndex = rawContent.indexOf(']');
        if (endIndex > 12) {
            try {
                const jsonStr = rawContent.substring(12, endIndex);
                const att = JSON.parse(jsonStr);
                const text = rawContent.substring(endIndex + 1).trim();
                return {
                    text,
                    attachment: {
                        url: att.url,
                        name: att.name,
                        type: att.type,
                        size: att.size
                    }
                };
            } catch (e) {
                console.error("Parse error", e);
            }
        }
    }
    return { text: rawContent || '', attachment: undefined };
}

console.log(parseMessageContent(sampleContent));
console.log(parseMessageContent('Plain text message without attachment'));
