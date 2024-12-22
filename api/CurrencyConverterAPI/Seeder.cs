using CurrencyConverterAPI.Entity;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;
using YamlDotNet.Serialization.Converters;

namespace CurrencyConverterAPI
{
    public static class Seeder
    {
        public static void Seed(this CurrencyRatesDbContext context, ILogger logger)
        {
            var filePath = Path.Combine(AppContext.BaseDirectory, "seed-data.yml");
            if (!File.Exists(filePath))
            {
                logger.LogError("The seed-data.yml file was not found");
                return;
            }

            var deserializer = new DeserializerBuilder()
                .WithNamingConvention(HyphenatedNamingConvention.Instance)
                .WithTypeConverter(new DateTimeConverter(formats: "dd.MM.yyyy HH:mm:ss"))
                .Build();

            using (var reader = new StreamReader(filePath))
            {
                YamlModel yaml = deserializer.Deserialize<YamlModel>(reader);

                foreach (var currency in yaml.Currencies)
                {
                    context.Currencies.Add(new Currency
                    {
                        Code = currency.Key,
                        DisplayName = currency.Value.DisplayName,
                        Description = currency.Value.Description,
                        Symbol = currency.Value.Symbol
                    });
                }

                context.SaveChanges();

                foreach (var rate in yaml.Rates)
                {
                    foreach (var value in rate.Values)
                    {
                        var currency = context.Currencies.FirstOrDefault(c => c.Code == value.Key);

                        if (currency == null)
                        {
                            logger.LogError($"Currency with code {value.Key} not found");
                            continue;
                        }

                        context.Rates.Add(new Rate()
                        {
                            Currency = currency,
                            Date = rate.Date,
                            RateToBase = value.Value
                        });
                    }
                }
            }

            context.SaveChanges();
        }
    }

    public class YamlModel
    {
        public Dictionary<string, CurrencyDetail> Currencies { get; set; }
        public List<RateDetail> Rates { get; set; }

        public class CurrencyDetail
        {
            public string DisplayName { get; set; }
            public string Description { get; set; }
            public char Symbol { get; set; }
        }

        public class RateDetail
        {
            public DateTime Date { get; set; }
            public Dictionary<string, double> Values { get; set; }
        }
    }
}
