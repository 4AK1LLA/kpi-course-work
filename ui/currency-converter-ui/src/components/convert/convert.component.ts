import { CommonModule, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Currency } from '../../models/currency';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-convert',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'convert.component.html'
})
export class ConvertComponent {
  public readonly TYPE_FROM = 1;
  public readonly TYPE_TO = 2;
  scales = [1, 5, 10, 25, 50, 100, 500, 1000, 5000, 10000];
  currencies: Currency[] = [];
  from: Currency;
  to: Currency;
  showCurrencies: Currency[];
  amountValue: string;
  amount: number;
  rate: number;

  constructor(
    private http: HttpClient,
    public route: ActivatedRoute,
    public router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit() {
    let data: any[] = this.route.snapshot.data['currencies'];
    data.forEach(c => this.currencies.push(new Currency(c.currencyId, c.code, c.displayName, c.description, c.symbol)));

    this.showCurrencies = this.currencies;

    let amount = this.route.snapshot.queryParamMap.get('amount');
    this.amountValue = !isNaN(parseFloat(amount || '')) ? amount! : '1.00';

    let fromCode = this.route.snapshot.queryParamMap.get('from');
    this.from = this.currencies.find(currency => currency.code === fromCode) || this.currencies[0];

    let toCode = this.route.snapshot.queryParamMap.get('to');
    this.to = this.currencies.find(currency => currency.code === toCode) || this.currencies[1];

    if (amount && fromCode && toCode) {
      this.updateRate();
    }
  }

  updateRate() {
    if (isNaN(parseFloat(this.amountValue))) {
      this.amount = 1;
      this.amountValue = '1.00';
    } else {
      this.amount = parseFloat(this.amountValue);
    }

    const params = new HttpParams()
      .set('fromId', this.from.id)
      .set('toId', this.to.id)
      .set('amount', 1);

    this.http.get<number>(environment.apiUrl + '/convert', { params })
      .subscribe(rate => this.rate = rate);
  }

  swapCurrencies() {
    [this.from, this.to] = [this.to, this.from];

    if (this.rate) {
      this.refreshComponent();
    }
  }

  changeCurrency(currency: Currency, type: number) {
    if (type === this.TYPE_FROM) {
      this.from = currency;
    }
    if (type === this.TYPE_TO) {
      this.to = currency;
    }

    if (this.rate) {
      this.refreshComponent();
    }
  }

  onCurrencyInputClear(event: any) {
    event.target.value = '';
    this.showCurrencies = this.currencies;
  }

  onCurrencyInputRefresh(event: any, type: number) {
    // timeout to prevent wrong currency name displaying
    setTimeout(() => event.target.value = type === this.TYPE_FROM ? this.from.getDisplay() : this.to.getDisplay(), 100);
  }

  onCurrencyInputLiveSearch(event: any) {
    let query = event.target.value.toLowerCase();

    this.showCurrencies = this.currencies.filter(currency =>
      currency.code.toLowerCase().includes(query) || currency.displayName.toLowerCase().includes(query)
    );
  }

  getDecimalDigits(number: number): string {
    let pipe = new DecimalPipe('en-US');
    let formatted = pipe.transform(number, '1.2-8') || '';
    let index = formatted.indexOf('.');
    return formatted.slice(index + 3, formatted.length);
  }

  refreshComponent() {
    let queryParams = {
      amount: this.amountValue,
      from: this.from.code,
      to: this.to.code
    };

    this.router.navigate(['currency-converter'], { queryParams });
  }
}