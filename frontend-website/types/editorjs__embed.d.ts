declare module '@editorjs/embed' {
    interface EmbedToolData {
        service: string;
        embed: string;
        caption?: string;
    }

    export default class EmbedTool {
        constructor({ data }: { data: EmbedToolData });
        save(): Promise<{ service: string; embed: string; caption?: string }>;
        render(): HTMLElement;
    }
}
