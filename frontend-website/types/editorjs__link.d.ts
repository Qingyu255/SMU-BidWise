declare module '@editorjs/link' {
    interface LinkToolData {
        link: string;
        meta: {
            title: string;
            image: string;
            description: string;
        };
    }

    export default class LinkTool {
        constructor({ data }: { data: LinkToolData });
        save(): Promise<{ link: string }>;
        render(): HTMLElement;
    }
}
