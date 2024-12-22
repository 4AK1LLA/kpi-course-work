import { Routes } from '@angular/router';
import { ConvertComponent } from '../components/convert/convert.component';
import { ChartComponent } from '../components/currency-chart/chart.component';
import { currencyResolver } from '../resolvers/currency.resolver';

export const routes: Routes = [
    { path: 'currency-converter', component: ConvertComponent, resolve: { currencies: currencyResolver } },
    { path: 'currency-chart', component: ChartComponent, resolve: { currencies: currencyResolver } },
    { path: '',   redirectTo: '/currency-converter', pathMatch: 'full' }
];