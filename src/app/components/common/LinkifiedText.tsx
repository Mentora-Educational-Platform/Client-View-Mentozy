import React from 'react';
import { ExternalLink } from 'lucide-react';

interface LinkifiedTextProps {
    text: string;
    className?: string;
    linkClassName?: string;
    showIcon?: boolean;
}

// Regex to capture full URLs (http/https), www. URLs, and email addresses
const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s]|www\.[^\s<]+[^<.,:;"')\]\s]|mailto:[^\s<]+|[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/gi;

export const LinkifiedText: React.FC<LinkifiedTextProps> = ({
    text,
    className = '',
    linkClassName,
    showIcon = false,
}) => {
    if (!text) return null;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Reset regex index
    URL_REGEX.lastIndex = 0;

    while ((match = URL_REGEX.exec(text)) !== null) {
        const matchIndex = match.index;
        const matchedText = match[0];

        // Push text preceding the match
        if (matchIndex > lastIndex) {
            parts.push(text.substring(lastIndex, matchIndex));
        }

        // Format href
        let href = matchedText;
        const isEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(matchedText);

        if (isEmail && !href.startsWith('mailto:')) {
            href = `mailto:${href}`;
        } else if (href.toLowerCase().startsWith('www.')) {
            href = `https://${href}`;
        }

        const isExternal = href.startsWith('http://') || href.startsWith('https://');

        parts.push(
            <a
                key={`link-${matchIndex}-${matchedText}`}
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                    e.stopPropagation();
                }}
                className={
                    linkClassName ||
                    'text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline font-bold break-words hover:opacity-85 transition-colors cursor-pointer inline-flex items-center gap-0.5'
                }
                title={isExternal ? `Open link: ${href}` : href}
            >
                <span>{matchedText}</span>
                {showIcon && isExternal && (
                    <ExternalLink className="w-3 h-3 inline-block flex-shrink-0 opacity-70 ml-0.5" />
                )}
            </a>
        );

        lastIndex = matchIndex + matchedText.length;
    }

    // Push trailing text
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return (
        <span className={className}>
            {parts}
        </span>
    );
};

export default LinkifiedText;
