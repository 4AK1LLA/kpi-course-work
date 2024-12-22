using CurrencyConverterAPI.Entity;

namespace CurrencyConverterAPI
{
    public class ChartService
    {
        private readonly CurrencyRatesDbContext _context;
        private readonly ILogger<ChartService> _logger;
        private readonly CurrencyRatesService _service;

        public ChartService(CurrencyRatesDbContext context, ILogger<ChartService> logger, CurrencyRatesService service)
        {
            _context = context;
            _logger = logger;
            _service = service;
        }

        public IDictionary<DateTime, double> GetChart(int fromId, int toId, string period)
        {
            Currency from = _context.Currencies.Find(fromId);
            Currency to = _context.Currencies.Find(toId);

            return GetChart(from, to, MapPeriodFromString(period));
        }

        public IDictionary<DateTime, double> GetChart(Currency from, Currency to, Period period)
        {
            if (from == null || to == null)
            {
                throw new ArgumentNullException("Both 'from' and 'to' currencies must be provided");
            }

            DateTime compareDate = GetDateToCompare(period);

            var dates = _context.Rates
                    .Where(rate => (rate.Currency.CurrencyId == from.CurrencyId || rate.Currency.CurrencyId == to.CurrencyId) && rate.Date >= compareDate)
                    .Select(rate => rate.Date)
                    .Distinct()
                    .ToHashSet();

            var chart = new Dictionary<DateTime, double>();

            foreach (var date in dates)
            {
                double rate = _service.Convert(from, to, 1, date);
                chart[date] = rate;
            }

            return chart;
        }

        private DateTime GetDateToCompare(Period period)
        {
            switch (period)
            {
                case Period.YEAR: return DateTime.Now.AddYears(-1);
                case Period.MONTH: return DateTime.Now.AddMonths(-1);
                case Period.WEEK: return DateTime.Now.AddDays(-7);
                case Period.DAY: return DateTime.Now.AddDays(-1);
                default: throw new NotImplementedException();
            }
        }

        private Period MapPeriodFromString(string str)
        {
            switch (str)
            {
                case "year": return Period.YEAR;
                case "month": return Period.MONTH;
                case "week": return Period.WEEK;
                case "day": return Period.DAY;
                default: throw new NotImplementedException();
            }
        }
    }

    public enum Period
    {
        YEAR, MONTH, WEEK, DAY
    }
}
