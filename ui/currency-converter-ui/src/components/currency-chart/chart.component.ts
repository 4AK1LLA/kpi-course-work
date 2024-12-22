import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { Currency } from '../../models/currency';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Rate } from '../../models/rate';

@Component({
  selector: 'app-convert',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'chart.component.html'
})
export class ChartComponent {
  public readonly TYPE_FROM = 1;
  public readonly TYPE_TO = 2;
  currencies: Currency[] = [];
  from: Currency;
  to: Currency;
  showCurrencies: Currency[];
  period: string;
  periods: string[];
  rates: Rate[];
  chart: any;
  min: Rate;
  max: Rate;
  percent: number;

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

    this.periods = ['day', 'week', 'month', 'year'];

    let periodParam = this.route.snapshot.queryParamMap.get('period');
    this.period = this.periods.includes(periodParam || '') ? periodParam! : this.periods[1];

    let fromCode = this.route.snapshot.queryParamMap.get('from');
    this.from = this.currencies.find(currency => currency.code === fromCode) || this.currencies[0];

    let toCode = this.route.snapshot.queryParamMap.get('to');
    this.to = this.currencies.find(currency => currency.code === toCode) || this.currencies[1];

    if (periodParam && fromCode && toCode) {
      this.createChart();
    }
  }

  createChart() {
    const params = new HttpParams()
      .set('fromId', this.from.id)
      .set('toId', this.to.id)
      .set('period', this.period);

    this.http.get(environment.apiUrl + '/chart', { params })
      .subscribe(data => {

        this.rates = Object.entries(data)
          .map(([d, value]) => {
            let date = new Date(d);
            let dateStr = new DatePipe('en-US').transform(date, 'dd.MM.yyyy HH:mm') || '';
            return new Rate(value, date, dateStr);
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());

          let sortedByRate = this.rates.slice().sort((a, b) => a.value - b.value);
          this.min = sortedByRate[0];
          this.max = sortedByRate[sortedByRate.length - 1];
          this.percent = ((this.rates[this.rates.length - 1].value - this.rates[0].value) / this.rates[0].value) * 100;

        this.chart = new Chart('currency-chart', {
          type: 'line',
          data: {
            labels: this.rates.map(rate => rate.dateStr),
            datasets: [{
              label: 'Rate',
              data: this.rates.map(rate => rate.value),
              tension: 0.2
            }]
          },
          options: {
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      });
  }

  swapCurrencies() {
    [this.from, this.to] = [this.to, this.from];

    if (this.chart) {
      this.onParamsUpdate();
    }
  }

  changeCurrency(currency: Currency, type: number) {
    if (type === this.TYPE_FROM) {
      this.from = currency;
    }
    if (type === this.TYPE_TO) {
      this.to = currency;
    }

    if (this.chart) {
      this.onParamsUpdate();
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

  onParamsUpdate() {
    let queryParams = {
      period: this.period,
      from: this.from.code,
      to: this.to.code
    };

    this.router.navigate(['currency-chart'], { queryParams });
  }
}