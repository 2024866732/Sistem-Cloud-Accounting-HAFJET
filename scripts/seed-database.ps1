# ============================================
# HAFJET Cloud Accounting - Database Seeding
# Seeds production database with Malaysian accounting data
# ============================================

param(
    [string]$MongoUri = "mongodb://localhost:27017/hafjet-bukku",
    [switch]$DryRun
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "HAFJET Database Seeding" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "⚠️  DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# Malaysian Chart of Accounts (simplified)
$chartOfAccounts = @(
    # Assets
    @{ code = "1000"; name = "Bank - Current Account"; type = "Asset"; category = "Bank" },
    @{ code = "1100"; name = "Accounts Receivable"; type = "Asset"; category = "Current Assets" },
    @{ code = "1200"; name = "Inventory"; type = "Asset"; category = "Current Assets" },
    @{ code = "1500"; name = "Fixed Assets - Equipment"; type = "Asset"; category = "Fixed Assets" },
    @{ code = "1600"; name = "Fixed Assets - Furniture"; type = "Asset"; category = "Fixed Assets" },
    
    # Liabilities
    @{ code = "2000"; name = "Accounts Payable"; type = "Liability"; category = "Current Liabilities" },
    @{ code = "2100"; name = "SST Payable"; type = "Liability"; category = "Current Liabilities" },
    @{ code = "2200"; name = "Accrued Expenses"; type = "Liability"; category = "Current Liabilities" },
    @{ code = "2500"; name = "Long-term Loan"; type = "Liability"; category = "Long-term Liabilities" },
    
    # Equity
    @{ code = "3000"; name = "Share Capital"; type = "Equity"; category = "Owner's Equity" },
    @{ code = "3100"; name = "Retained Earnings"; type = "Equity"; category = "Owner's Equity" },
    
    # Revenue
    @{ code = "4000"; name = "Sales Revenue"; type = "Revenue"; category = "Operating Revenue" },
    @{ code = "4100"; name = "Service Revenue"; type = "Revenue"; category = "Operating Revenue" },
    @{ code = "4900"; name = "Other Income"; type = "Revenue"; category = "Other Revenue" },
    
    # Expenses
    @{ code = "5000"; name = "Cost of Goods Sold"; type = "Expense"; category = "Direct Costs" },
    @{ code = "6000"; name = "Salaries & Wages"; type = "Expense"; category = "Operating Expenses" },
    @{ code = "6100"; name = "Rent Expense"; type = "Expense"; category = "Operating Expenses" },
    @{ code = "6200"; name = "Utilities"; type = "Expense"; category = "Operating Expenses" },
    @{ code = "6300"; name = "Office Supplies"; type = "Expense"; category = "Operating Expenses" },
    @{ code = "6400"; name = "Marketing & Advertising"; type = "Expense"; category = "Operating Expenses" },
    @{ code = "6500"; name = "Professional Fees"; type = "Expense"; category = "Operating Expenses" },
    @{ code = "6900"; name = "Other Expenses"; type = "Expense"; category = "Other Expenses" }
)

# Malaysian Tax Codes
$taxCodes = @(
    @{ 
        code = "SST-6";
        name = "Sales & Service Tax (6%)";
        rate = 0.06;
        type = "Sales";
        description = "Standard SST rate in Malaysia"
    },
    @{ 
        code = "GST-6";
        name = "Goods & Services Tax (6% - Historical)";
        rate = 0.06;
        type = "Sales";
        description = "GST rate (2015-2018) for historical data"
    },
    @{ 
        code = "EXEMPT";
        name = "Tax Exempt";
        rate = 0.00;
        type = "Exempt";
        description = "Exempt from tax"
    },
    @{ 
        code = "ZERO";
        name = "Zero Rated";
        rate = 0.00;
        type = "Zero";
        description = "Zero rated supply"
    }
)

# Default Company Settings
$defaultSettings = @{
    dateFormat = "DD/MM/YYYY";
    currency = "MYR";
    currencySymbol = "RM";
    fiscalYearStart = "01-01";
    fiscalYearEnd = "12-31";
    defaultTaxCode = "SST-6";
    invoicePrefix = "INV";
    quotationPrefix = "QUO";
    receiptPrefix = "RCP";
    nextInvoiceNumber = 1001;
    nextQuotationNumber = 1001;
    nextReceiptNumber = 1001;
    enableEInvoice = $true;
    lhdnMode = "sandbox";
    country = "Malaysia";
    locale = "en-MY";
    timezone = "Asia/Kuala_Lumpur"
}

# Malaysian Business Categories
$businessCategories = @(
    "Retail & Wholesale",
    "Food & Beverage",
    "Professional Services",
    "Construction",
    "Manufacturing",
    "IT & Technology",
    "Healthcare",
    "Education",
    "Transportation",
    "Real Estate",
    "Others"
)

Write-Host "Seed Data Summary:" -ForegroundColor Yellow
Write-Host "  • Chart of Accounts: $($chartOfAccounts.Count) accounts"
Write-Host "  • Tax Codes: $($taxCodes.Count) codes"
Write-Host "  • Business Categories: $($businessCategories.Count) categories"
Write-Host "  • Default Settings: 1 set"
Write-Host ""

if ($DryRun) {
    Write-Host "Chart of Accounts (preview):" -ForegroundColor Cyan
    $chartOfAccounts | Select-Object -First 5 | Format-Table code, name, type, category
    Write-Host "... and $($chartOfAccounts.Count - 5) more" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Tax Codes (preview):" -ForegroundColor Cyan
    $taxCodes | Format-Table code, name, rate, type
    Write-Host ""
    
    Write-Host "✓ Dry run complete - no changes made" -ForegroundColor Green
    exit 0
}

# Confirmation
Write-Host "⚠️  WARNING: This will add seed data to the database" -ForegroundColor Yellow
Write-Host "Database: $MongoUri" -ForegroundColor Yellow
Write-Host ""
Write-Host -NoNewline "Continue? (yes/no): "
$confirm = Read-Host

if ($confirm -ne "yes") {
    Write-Host "Seeding cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Starting database seeding..." -ForegroundColor Yellow
Write-Host ""

# Create seed data JSON files
$seedDataDir = "backend/seeds"
New-Item -ItemType Directory -Path $seedDataDir -Force | Out-Null

# Write Chart of Accounts
$chartOfAccounts | ConvertTo-Json -Depth 10 | Out-File "$seedDataDir/chart-of-accounts.json"
Write-Host "✓ Chart of Accounts written to $seedDataDir/chart-of-accounts.json" -ForegroundColor Green

# Write Tax Codes
$taxCodes | ConvertTo-Json -Depth 10 | Out-File "$seedDataDir/tax-codes.json"
Write-Host "✓ Tax Codes written to $seedDataDir/tax-codes.json" -ForegroundColor Green

# Write Default Settings
$defaultSettings | ConvertTo-Json -Depth 10 | Out-File "$seedDataDir/default-settings.json"
Write-Host "✓ Default Settings written to $seedDataDir/default-settings.json" -ForegroundColor Green

# Write Business Categories
$businessCategories | ConvertTo-Json | Out-File "$seedDataDir/business-categories.json"
Write-Host "✓ Business Categories written to $seedDataDir/business-categories.json" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Database Seeding Complete" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Seed data files created in $seedDataDir" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review seed data files in $seedDataDir"
Write-Host "2. Import to MongoDB using backend seed script:"
Write-Host "   cd backend && npm run seed:import"
Write-Host ""
Write-Host "Or manually import using mongoimport:"
Write-Host "   mongoimport --uri '$MongoUri' --collection accounts --file $seedDataDir/chart-of-accounts.json --jsonArray"
Write-Host "   mongoimport --uri '$MongoUri' --collection taxcodes --file $seedDataDir/tax-codes.json --jsonArray"
Write-Host ""
