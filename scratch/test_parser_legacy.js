function parseMessageAttachment(msg) {
    // 1. Direct attachment columns on message
    if (msg.attachment_url) {
        return {
            text: msg.content || '',
            attachment: {
                url: msg.attachment_url,
                name: msg.attachment_name || 'Attachment',
                type: msg.attachment_type || 'application/octet-stream',
                size: Number(msg.attachment_size) || 0
            }
        };
    }

    // 2. Encoded [ATTACHMENT: {...}] payload
    if (msg.content && msg.content.startsWith('[ATTACHMENT:')) {
        const endIndex = msg.content.indexOf(']');
        if (endIndex > 12) {
            try {
                const jsonStr = msg.content.substring(12, endIndex);
                const att = JSON.parse(jsonStr);
                const text = msg.content.substring(endIndex + 1).trim();
                return {
                    text,
                    attachment: {
                        url: att.url,
                        name: att.name || 'Attachment',
                        type: att.type || 'application/octet-stream',
                        size: Number(att.size) || 0
                    }
                };
            } catch (e) {
                console.error("Failed to parse attachment payload:", e);
            }
        }
    }

    // 3. Legacy JSON format check (e.g. {"url":"..."} or {"content":"..."})
    if (msg.content && msg.content.trim().startsWith('{') && msg.content.includes('"url"')) {
        try {
            const parsed = JSON.parse(msg.content.trim());
            if (parsed && parsed.url) {
                return {
                    text: parsed.content || '',
                    attachment: {
                        url: parsed.url,
                        name: parsed.name || 'Attachment',
                        type: parsed.type || 'application/octet-stream',
                        size: Number(parsed.size) || 0
                    }
                };
            }
        } catch (e) {
            // Not valid JSON, treat as plain text
        }
    }

    return { text: msg.content || '', attachment: undefined };
}

// Test cases
console.log("1. Normal Text:", parseMessageAttachment({ content: "Hello teacher" }));
console.log("2. Column Attachment:", parseMessageAttachment({ content: "Here is assignment", attachment_url: "https://example.com/file.pdf", attachment_name: "assignment.pdf", attachment_type: "application/pdf", attachment_size: 2400000 }));
console.log("3. Encoded Payload:", parseMessageAttachment({ content: '[ATTACHMENT:{"url":"https://example.com/doc.pdf","name":"doc.pdf","type":"application/pdf","size":100}] Check this' }));
console.log("4. Legacy JSON:", parseMessageAttachment({ content: '{"url":"https://example.com/legacy.pdf","name":"legacy.pdf","type":"application/pdf"}' }));
