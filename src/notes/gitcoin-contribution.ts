import Main from '../index';
import Base from './base';
import { NotesOptions } from './index';
import axios from 'axios';

class GitcoinContribution extends Base {
    constructor(main: Main) {
        super(main);
    }

    async get(options: NotesOptions) {
        const response = (
            await axios.get(`https://pregod.rss3.dev/v0.4.0/account:${options.identity}@ethereum/notes`, {
                params: {
                    item_sources: 'Gitcoin Contribution',
                    limit: options.limit,
                },
            })
        ).data;

        const result: Notes = {
            total: response.total,
            list: response.list.map((item: any) => {
                delete item.identifier;
                delete item.links;
                delete item.backlinks;

                item.authors = item.authors.map((author: string) => {
                    return {
                        identity: author.match(/account:(.*)@/)?.[1],
                        platform: author.match(/@(.*)$/)?.[1],
                    };
                });

                item.title =
                    `Contributed ${item.metadata.value_amount}${item.metadata.value_symbol} to ` + (item.title || '');
                item.summary = {
                    content: item.summary,
                    mime_type: 'text/plain',
                };

                if (!item.attachments) {
                    item.attachments = [];
                }
                item.attachments.forEach((attachment: any) => {
                    if (attachment.address) {
                        attachment.address = this.main.utils.replaceIPFS(attachment.address);
                    }
                    return attachment;
                });

                const body = item.attachments?.find((attachment: any) => attachment.type === 'description');
                if (body) {
                    item.body = body;
                    item.attachments = item.attachments.filter((attachment: any) => attachment.type !== 'description');
                    if (!item.attachments.length) {
                        delete item.attachments;
                    }
                    delete item.body.type;
                } else {
                    item.body = item.summary;
                }

                return item;
            }),
        };

        return result;
    }
}

export default GitcoinContribution;
