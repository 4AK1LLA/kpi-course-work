using CurrencyConverterAPI.Entity;

namespace CurrencyConverterAPI
{
    public class CurrencyRatesService
    {
        private readonly CurrencyRatesDbContext _context;
        private readonly ILogger<CurrencyRatesService> _logger;

        public CurrencyRatesService(CurrencyRatesDbContext context, ILogger<CurrencyRatesService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public double Convert(int fromId, int toId, double amount)
        {
            Currency from = _context.Currencies.Find(fromId);
            Currency to = _context.Currencies.Find(toId);

            return Convert(from, to, amount);
        }

        public double Convert(Currency from, Currency to, double amount)
        {
            return Convert(from, to, amount, DateTime.Now);
        }

        public double Convert(Currency from, Currency to, double amount, DateTime date)
        {
            if (from == null || to == null)
            {
                throw new ArgumentNullException("Both 'from' and 'to' currencies must be provided");
            }

            if (amount < 0)
            {
                throw new ArgumentException("Amount must be a positive number");
            }

            double fromRate = GetRateForDate(from, date);
            double toRate = GetRateForDate(to, date);

            return amount / toRate * fromRate;
        }

        public double GetRateForDate(Currency currency, DateTime date)
        {
            Rate rate = _context.Rates
                .Where(rate => rate.Currency.CurrencyId == currency.CurrencyId && rate.Date <= date)
                .OrderByDescending(rate => rate.Date)
                .FirstOrDefault();

            if (rate == null)
            {
                throw new Exception($"Rate not found for currency {currency.Code} and date {date}");
            }

            return rate.RateToBase;
        }

        public IList<Currency> GetAllCurrencies()
        {
            return _context.Currencies.ToList();
        }
    }
}
