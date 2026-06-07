declare module 'clamscan' {
    interface ClamScanOptions {
        clamdscan?: {
            socket: string;
        };
    }

    class NodeClam {
        init(options?: ClamScanOptions): Promise<any>;
    }

    export default NodeClam;
}
