using CurrencyConverterAPI;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<CurrencyRatesDbContext>(options =>
{
    bool useSql = builder.Configuration.GetValue<bool>("UseSql");
    if (useSql)
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
    }
    else
    {
        options.UseInMemoryDatabase("CurrencyConverter");
    }
});

builder.Services.AddScoped<CurrencyRatesService>();
builder.Services.AddScoped<ChartService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        b => b.WithOrigins(builder.Configuration.GetValue<string>("CorsOrigin"))
        .AllowAnyHeader()
        .AllowAnyMethod()
    );
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.MapGet("/currencies", (CurrencyRatesService service) => service.GetAllCurrencies());

app.MapGet("/convert", (int fromId, int toId, double amount, CurrencyRatesService service) => service.Convert(fromId, toId, amount));

app.MapGet("/chart", (int fromId, int toId, string period, ChartService service) => service.GetChart(fromId, toId, period));

app.Run();