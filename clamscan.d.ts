declare module 'clamscan' {
    class NodeClam {
        constructor();
        init(options: any): Promise<any>;
    }
    export default NodeClam;
}