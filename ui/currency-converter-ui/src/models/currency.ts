export class Currency {
    id: number;
    code: string;
    displayName: string;
    description: string;
    symbol: string;

    constructor(id: number, code: string, displayName: string, description: string, symbol: string) {
        this.id = id;
        this.code = code;
        this.displayName = displayName;
        this.description = description;
        this.symbol = symbol;
    }

    getDisplay(): string {
        return this.code + ' - ' + this.displayName;
    }
}