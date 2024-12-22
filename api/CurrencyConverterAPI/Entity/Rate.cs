namespace CurrencyConverterAPI.Entity
{
    public class Rate
    {
        public int RateId { get; set; }
        public double RateToBase { get; set; }
        public DateTime Date { get; set; }
        public Currency Currency { get; set; }
    }
}
