export class Rate {
    value: number;
    date: Date;
    dateStr: string;

    constructor(value: number, date: Date, dateStr: string) {
        this.value = value;
        this.date = date;
        this.dateStr = dateStr;
    }
}