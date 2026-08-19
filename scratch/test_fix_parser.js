function parseMessageAttachment(msg) {
    let text = msg.content || '';
    let attachment = undefined;

    // First check if content contains [ATTACHMENT:{...}] prefix
    if (text.includes('[ATTACHMENT:')) {
        const startIndex = text.indexOf('[ATTACHMENT:');
        const endIndex = text.indexOf(']', startIndex);
        if (endIndex > startIndex + 12) {
            try {
                const jsonStr = text.substring(startIndex + 12, endIndex);
                const att = JSON.parse(jsonStr);
                attachment = {
                    url: att.url,
                    name: att.name || 'Attachment',
                    type: att.type || 'application/octet-stream',
                    size: Number(att.size) || 0
                };
            } catch (e) {
                console.error("Error parsing JSON attachment payload:", e);
            }
            // Strip out [ATTACHMENT:{...}] from text message!
            text = (text.substring(0, startIndex) + text.substring(endIndex + 1)).trim();
        }
    } else if (msg.attachment_url) {
        attachment = {
            url: msg.attachment_url,
            name: msg.attachment_name || 'Attachment',
            type: msg.attachment_type || 'application/octet-stream',
            size: Number(msg.attachment_size) || 0
        };
    } else if (text.trim().startsWith('{') && text.includes('"url"')) {
        try {
            const parsed = JSON.parse(text.trim());
            if (parsed && parsed.url) {
                attachment = {
                    url: parsed.url,
                    name: parsed.name || 'Attachment',
                    type: parsed.type || 'application/octet-stream',
                    size: Number(parsed.size) || 0
                };
                text = parsed.content || '';
            }
        } catch (e) {}
    }

    return { text, attachment };
}

// Test cases
console.log("Case 1 (Payload with caption):", parseMessageAttachment({ content: '[ATTACHMENT:{"url":"https://.../img.png","name":"img.png","type":"image/png","size":1234}] Please check this screenshot', attachment_url: 'https://.../img.png' }));
console.log("Case 2 (Payload attachment only):", parseMessageAttachment({ content: '[ATTACHMENT:{"url":"https://.../img.png","name":"img.png","type":"image/png","size":1234}]', attachment_url: 'https://.../img.png' }));
console.log("Case 3 (Plain text only):", parseMessageAttachment({ content: 'Hello teacher' }));
