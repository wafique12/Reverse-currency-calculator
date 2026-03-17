import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Landmark, TrendingDown, Award, Edit2, Receipt, ArrowRight, ChevronDown, ChevronUp, Globe, Coins, ArrowLeftRight, DollarSign } from 'lucide-react';

// Country to Currency Mapping - SINGLE SOURCE OF TRUTH
const COUNTRY_CONFIG = {
    'Egypt': {
        currency: 'EGP',
        flag: '🇪🇬',
        bankName: 'NBE'
    },
    'Saudi Arabia': {
        currency: 'SAR',
        flag: '🇸🇦',
        bankName: 'Al Rajhi'
    },
    'UAE': {
        currency: 'AED',
        flag: '🇦🇪',
        bankName: 'Emirates NBD'
    },
    'Kuwait': {
        currency: 'KWD',
        flag: '🇰🇼',
        bankName: 'NBK'
    },
    'Jordan': {
        currency: 'JOD',
        flag: '🇯🇴',
        bankName: 'Arab Bank'
    }
};

const ReverseRemittancePlanner = () => {
    // Initialize state from localStorage or use defaults
    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem('remittance-expenses');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'School Fees', amount: 50000 },
            { id: 2, name: 'Rent', amount: 30000 }
        ];
    });

    // FIXED: Direct state variables with EXPLICIT DEFAULT VALUES
    const [directRate, setDirectRate] = useState(() => {
        const saved = localStorage.getItem('remittance-direct-rate');
        return saved ? parseFloat(saved) : 13;
    });

    const [sellRate, setSellRate] = useState(() => {
        const saved = localStorage.getItem('remittance-sell-rate');
        return saved ? parseFloat(saved) : 3.75;
    });

    const [buyRate, setBuyRate] = useState(() => {
        const saved = localStorage.getItem('remittance-buy-rate');
        return saved ? parseFloat(saved) : 50;
    });

    const [bankNames, setBankNames] = useState(() => {
        const saved = localStorage.getItem('remittance-bank-names');
        return saved ? JSON.parse(saved) : {
            currencyBridge: 'USD'
        };
    });

    const [transferFrom, setTransferFrom] = useState(() => {
        const saved = localStorage.getItem('remittance-transfer-from');
        return saved || 'Saudi Arabia';
    });

    const [transferTo, setTransferTo] = useState(() => {
        const saved = localStorage.getItem('remittance-transfer-to');
        return saved || 'Egypt';
    });

    const [inputCurrency, setInputCurrency] = useState(() => {
        const saved = localStorage.getItem('remittance-input-currency');
        if (saved) return saved;
        return COUNTRY_CONFIG[transferFrom]?.currency || 'SAR';
    });

    const [selectedPath, setSelectedPath] = useState(() => {
        const saved = localStorage.getItem('remittance-selected-path');
        return saved || 'A';
    });

    const [showBreakdown, setShowBreakdown] = useState(() => {
        const saved = localStorage.getItem('remittance-show-breakdown');
        return saved ? JSON.parse(saved) : false;
    });

    const [showExpenses, setShowExpenses] = useState(() => {
        const saved = localStorage.getItem('remittance-show-expenses');
        return saved ? JSON.parse(saved) : false;
    });

    const [newExpenseName, setNewExpenseName] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState('');
    const [editingBank, setEditingBank] = useState(null);
    const [tempBankName, setTempBankName] = useState('');

    const [invalidFields, setInvalidFields] = useState({
        newExpenseName: false,
        newExpenseAmount: false
    });

    const countries = Object.keys(COUNTRY_CONFIG);
    const fromCurrency = COUNTRY_CONFIG[transferFrom].currency;
    const toCurrency = COUNTRY_CONFIG[transferTo].currency;
    const availableCurrencies = Array.from(new Set([fromCurrency, toCurrency, 'USD']));

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('remittance-expenses', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('remittance-direct-rate', directRate.toString());
    }, [directRate]);

    useEffect(() => {
        localStorage.setItem('remittance-sell-rate', sellRate.toString());
    }, [sellRate]);

    useEffect(() => {
        localStorage.setItem('remittance-buy-rate', buyRate.toString());
    }, [buyRate]);

    useEffect(() => {
        localStorage.setItem('remittance-bank-names', JSON.stringify(bankNames));
    }, [bankNames]);

    useEffect(() => {
        localStorage.setItem('remittance-selected-path', selectedPath);
    }, [selectedPath]);

    useEffect(() => {
        localStorage.setItem('remittance-show-breakdown', JSON.stringify(showBreakdown));
    }, [showBreakdown]);

    useEffect(() => {
        localStorage.setItem('remittance-show-expenses', JSON.stringify(showExpenses));
    }, [showExpenses]);

    useEffect(() => {
        localStorage.setItem('remittance-input-currency', inputCurrency);
    }, [inputCurrency]);

    useEffect(() => {
        localStorage.setItem('remittance-transfer-from', transferFrom);
    }, [transferFrom]);

    useEffect(() => {
        localStorage.setItem('remittance-transfer-to', transferTo);
    }, [transferTo]);

    const handleFromCountryChange = (newFromCountry) => {
        if (newFromCountry === transferTo) {
            setTransferTo(transferFrom);
        }
        setTransferFrom(newFromCountry);
        
        const newCurrency = COUNTRY_CONFIG[newFromCountry].currency;
        setInputCurrency(newCurrency);
    };

    const handleToCountryChange = (newToCountry) => {
        if (newToCountry === transferFrom) {
            setTransferFrom(transferTo);
            const newCurrency = COUNTRY_CONFIG[transferTo].currency;
            setInputCurrency(newCurrency);
        }
        setTransferTo(newToCountry);
    };

    const handleSwapCountries = () => {
        const temp = transferFrom;
        setTransferFrom(transferTo);
        setTransferTo(temp);
        
        const newCurrency = COUNTRY_CONFIG[transferTo].currency;
        setInputCurrency(newCurrency);
    };

    const targetTotal = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const getResultCurrency = () => {
        if (inputCurrency === fromCurrency) {
            return toCurrency;
        } else if (inputCurrency === toCurrency) {
            return fromCurrency;
        } else {
            return toCurrency;
        }
    };

    const resultCurrency = getResultCurrency();

    const getExchangeRate = (from, to) => {
        if (from === to) return 1;
        
        // Use direct state variables for rates
        if (from === 'SAR' && to === 'EGP') return directRate;
        if (from === 'EGP' && to === 'SAR') return 1 / directRate;
        if (from === 'USD' && to === 'EGP') return buyRate;
        if (from === 'EGP' && to === 'USD') return 1 / buyRate;
        if (from === 'USD' && to === 'SAR') return sellRate;
        if (from === 'SAR' && to === 'USD') return 1 / sellRate;
        
        return 1;
    };

    let pathA_Result, pathB_Result;

    const directConversionRate = getExchangeRate(inputCurrency, resultCurrency);
    pathA_Result = targetTotal * directConversionRate;

    const inputToUsd = getExchangeRate(inputCurrency, 'USD');
    const usdToResult = getExchangeRate('USD', resultCurrency);
    pathB_Result = targetTotal * inputToUsd * usdToResult;

    let bestPath = null;
    if (pathA_Result > 0 && pathB_Result > 0 && Math.abs(pathA_Result - pathB_Result) > 0.01) {
        if (inputCurrency === fromCurrency) {
            bestPath = pathA_Result > pathB_Result ? 'A' : 'B';
        } else if (inputCurrency === toCurrency) {
            bestPath = pathA_Result < pathB_Result ? 'A' : 'B';
        } else {
            bestPath = pathA_Result > pathB_Result ? 'A' : 'B';
        }
    }
    
    const savings = bestPath ? Math.abs(pathA_Result - pathB_Result) : 0;

    const calculateItemCostInResultCurrency = (itemAmount) => {
        if (selectedPath === 'A') {
            const directConversionRate = getExchangeRate(inputCurrency, resultCurrency);
            return itemAmount * directConversionRate;
        } else {
            const inputToUsd = getExchangeRate(inputCurrency, 'USD');
            const usdToResult = getExchangeRate('USD', resultCurrency);
            return itemAmount * inputToUsd * usdToResult;
        }
    };

    const addExpense = () => {
        const nameValid = newExpenseName.trim() !== '';
        const amountValid = newExpenseAmount !== '' && parseFloat(newExpenseAmount) > 0;

        setInvalidFields({
            newExpenseName: !nameValid,
            newExpenseAmount: !amountValid
        });

        if (nameValid && amountValid) {
            const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
            setExpenses([...expenses, {
                id: newId,
                name: newExpenseName.trim(),
                amount: parseFloat(newExpenseAmount)
            }]);
            setNewExpenseName('');
            setNewExpenseAmount('');
            setInvalidFields({ newExpenseName: false, newExpenseAmount: false });
        }
    };

    const removeExpense = (id) => {
        setExpenses(expenses.filter(exp => exp.id !== id));
    };

    const updateExpense = (id, field, value) => {
        setExpenses(expenses.map(exp => 
            exp.id === id ? { ...exp, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : exp
        ));
    };

    const startEditingBank = (field) => {
        setEditingBank(field);
        setTempBankName(bankNames[field]);
    };

    const saveBank = () => {
        if (tempBankName.trim()) {
            setBankNames({ ...bankNames, [editingBank]: tempBankName.trim() });
        }
        setEditingBank(null);
        setTempBankName('');
    };

    const cancelEditBank = () => {
        setEditingBank(null);
        setTempBankName('');
    };

    const currentYear = new Date().getFullYear();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-t-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Landmark className="w-8 h-8" />
                        <h1 className="text-3xl md:text-4xl font-bold">Reverse Remittance Planner</h1>
                    </div>
                    <p className="text-blue-100 text-sm">Calculate the optimal currency exchange path for your transfers</p>
                </div>

                <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-8">
                    {/* COMPACT Transfer Configuration Section */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-slate-600">From:</label>
                                <div className="relative">
                                    <select
                                        value={transferFrom}
                                        onChange={(e) => handleFromCountryChange(e.target.value)}
                                        className="pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-900 appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                                    >
                                        {countries.map(country => (
                                            <option key={country} value={country}>
                                                {COUNTRY_CONFIG[country].flag} {country}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <button
                                onClick={handleSwapCountries}
                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all shadow-sm hover:shadow active:scale-95"
                                title="Swap countries"
                            >
                                <ArrowLeftRight className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-slate-600">To:</label>
                                <div className="relative">
                                    <select
                                        value={transferTo}
                                        onChange={(e) => handleToCountryChange(e.target.value)}
                                        className="pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-900 appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                                    >
                                        {countries.map(country => (
                                            <option key={country} value={country}>
                                                {COUNTRY_CONFIG[country].flag} {country}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="h-6 w-px bg-slate-300 hidden md:block"></div>

                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-slate-600">Currency:</label>
                                <div className="relative">
                                    <select
                                        value={inputCurrency}
                                        onChange={(e) => setInputCurrency(e.target.value)}
                                        className="pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-900 appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                                    >
                                        {availableCurrencies.map(currency => (
                                            <option key={currency} value={currency}>{currency}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-md text-xs font-medium text-blue-900">
                                <span>{inputCurrency === fromCurrency ? '📊 Maximize' : '💰 Minimize'}</span>
                                <span className="text-blue-600">→</span>
                                <span className="font-bold">{resultCurrency}</span>
                            </div>
                        </div>
                    </div>

                    {/* COLLAPSIBLE Expenses Section */}
                    <div className="mb-6">
                        <div 
                            className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                            onClick={() => setShowExpenses(!showExpenses)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <TrendingDown className="w-6 h-6 text-white" />
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Monthly Expenses</h2>
                                        <p className="text-xs text-blue-100">{expenses.length} item{expenses.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs text-blue-100">Target Total</div>
                                        <div className="text-2xl font-bold text-white">{targetTotal.toLocaleString()} {inputCurrency}</div>
                                    </div>
                                    <button className="text-white p-1 hover:bg-blue-600 rounded transition-colors">
                                        {showExpenses ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {showExpenses && (
                            <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-fadeIn">
                                <div className="space-y-2 mb-3">
                                    {expenses.map((expense) => (
                                        <div key={expense.id} className="flex gap-2 items-center bg-white p-2 rounded-md border border-slate-200">
                                            <input
                                                type="text"
                                                value={expense.name}
                                                onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 text-sm"
                                                placeholder="Expense name"
                                            />
                                            <div className="relative w-32 md:w-36">
                                                <input
                                                    type="number"
                                                    value={expense.amount}
                                                    onChange={(e) => updateExpense(expense.id, 'amount', e.target.value)}
                                                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 text-sm"
                                                    placeholder="Amount"
                                                    min="0.01"
                                                    step="0.01"
                                                />
                                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs font-light pointer-events-none">
                                                    {inputCurrency}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => removeExpense(expense.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={newExpenseName}
                                        onChange={(e) => {
                                            setNewExpenseName(e.target.value);
                                            if (invalidFields.newExpenseName && e.target.value.trim()) {
                                                setInvalidFields(prev => ({ ...prev, newExpenseName: false }));
                                            }
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && addExpense()}
                                        className={`flex-1 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm ${
                                            invalidFields.newExpenseName 
                                                ? 'border-2 border-red-500' 
                                                : 'border border-slate-300 focus:border-transparent'
                                        }`}
                                        placeholder="New expense name"
                                    />
                                    <div className="relative w-32 md:w-36">
                                        <input
                                            type="number"
                                            value={newExpenseAmount}
                                            onChange={(e) => {
                                                setNewExpenseAmount(e.target.value);
                                                if (invalidFields.newExpenseAmount && e.target.value && parseFloat(e.target.value) > 0) {
                                                    setInvalidFields(prev => ({ ...prev, newExpenseAmount: false }));
                                                }
                                            }}
                                            onKeyPress={(e) => e.key === 'Enter' && addExpense()}
                                            className={`w-full px-3 py-2 pr-10 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm ${
                                                invalidFields.newExpenseAmount 
                                                    ? 'border-2 border-red-500' 
                                                    : 'border border-slate-300 focus:border-transparent'
                                            }`}
                                            placeholder="Amount"
                                            min="0.01"
                                            step="0.01"
                                        />
                                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs font-light pointer-events-none">
                                            {inputCurrency}
                                        </span>
                                    </div>
                                    <button
                                        onClick={addExpense}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1 font-medium text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Exchange Rates Section - FIXED WITH EXPLICIT VALUE BINDING */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Exchange Rates</h2>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-lg p-4">
                                <h3 className="text-base font-bold text-green-900 mb-3 flex items-center gap-2">
                                    <Landmark className="w-4 h-4" />
                                    {COUNTRY_CONFIG[transferFrom]?.bankName} ({transferFrom})
                                </h3>
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            SAR to EGP (Direct Transfer)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={directRate}
                                            onChange={(e) => setDirectRate(parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 text-sm"
                                            min="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            USD to SAR (Sell Rate)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={sellRate}
                                            onChange={(e) => setSellRate(parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 text-sm"
                                            min="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4">
                                <h3 className="text-base font-bold text-blue-900 mb-3 flex items-center gap-2">
                                    <Landmark className="w-4 h-4" />
                                    {COUNTRY_CONFIG[transferTo]?.bankName} ({transferTo})
                                </h3>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        USD to EGP (Buy Rate)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={buyRate}
                                        onChange={(e) => setBuyRate(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 text-sm"
                                        min="0.01"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Comparison Results</h2>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Path A */}
                            <div className={`relative rounded-lg p-5 border-2 transition-all ${
                                bestPath === 'A' 
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-lg' 
                                    : 'bg-white border-slate-200'
                            }`}>
                                {bestPath === 'A' && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                        <Award className="w-3 h-3" />
                                        Best
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-base font-bold text-slate-800">Path A:</h3>
                                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-black tracking-wider rounded-full shadow-md" style={{fontFamily: 'monospace, sans-serif'}}>
                                        DIRECT
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 mb-3">Via {COUNTRY_CONFIG[transferFrom]?.bankName}</p>
                                <div className="bg-white rounded-md p-3 border border-slate-200 mb-2">
                                    <div className="text-xs text-slate-500 mb-1">
                                        {inputCurrency === fromCurrency ? 'You receive:' : 'You pay:'}
                                    </div>
                                    <div className="text-2xl font-bold text-blue-900">
                                        {pathA_Result.toLocaleString(undefined, {maximumFractionDigits: 2})} {resultCurrency}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                                    <span className="font-semibold">Calc:</span> {targetTotal.toLocaleString()} {inputCurrency} × {directConversionRate.toFixed(4)} = {pathA_Result.toLocaleString(undefined, {maximumFractionDigits: 2})} {resultCurrency}
                                </div>
                            </div>

                            {/* Path B */}
                            <div className={`relative rounded-lg p-5 border-2 transition-all ${
                                bestPath === 'B' 
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-lg' 
                                    : 'bg-white border-slate-200'
                            }`}>
                                {bestPath === 'B' && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                        <Award className="w-3 h-3" />
                                        Best
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-base font-bold text-slate-800">Path B:</h3>
                                    <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-black tracking-wider rounded-full shadow-md flex items-center gap-1" style={{fontFamily: 'monospace, sans-serif'}}>
                                        <DollarSign className="w-3 h-3" />
                                        USD BRIDGE
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 mb-3">Via USD conversion</p>
                                <div className="bg-white rounded-md p-3 border border-slate-200 mb-2">
                                    <div className="text-xs text-slate-500 mb-1">
                                        {inputCurrency === fromCurrency ? 'You receive:' : 'You pay:'}
                                    </div>
                                    <div className="text-2xl font-bold text-blue-900">
                                        {pathB_Result.toLocaleString(undefined, {maximumFractionDigits: 2})} {resultCurrency}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                                    <span className="font-semibold">Calc:</span> {targetTotal.toLocaleString()} {inputCurrency} × {inputToUsd.toFixed(4)} × {usdToResult.toFixed(4)} = {pathB_Result.toLocaleString(undefined, {maximumFractionDigits: 2})} {resultCurrency}
                                </div>
                            </div>
                        </div>

                     {/* Savings Summary */}
                        {bestPath && savings > 0 && (
                            <div className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div>
                                        <div className="text-xs opacity-90">
                                            {inputCurrency === fromCurrency ? 'Extra received' : 'Savings'} with Path {bestPath}:
                                        </div>
                                        <div className="text-2xl font-bold">{savings.toLocaleString(undefined, {maximumFractionDigits: 2})} {resultCurrency}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs opacity-90">Difference:</div>
                                        <div className="text-lg font-semibold">{((savings / Math.max(pathA_Result, pathB_Result)) * 100).toFixed(2)}%</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detailed Breakdown - Collapsible */}
                    <div>
                        <button
                            onClick={() => setShowBreakdown(!showBreakdown)}
                            className="w-full flex items-center justify-between bg-gradient-to-r from-slate-700 to-slate-600 text-white p-3 rounded-lg shadow-lg hover:from-slate-800 hover:to-slate-700 transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Receipt className="w-5 h-5" />
                                <h2 className="text-lg font-bold">Detailed Breakdown</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs opacity-90">{showBreakdown ? 'Hide' : 'Show'}</span>
                                {showBreakdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                        </button>

                        {showBreakdown && (
                            <div className="mt-4 space-y-4 animate-fadeIn">
                                <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg p-3">
                                    <label className="block text-xs font-semibold text-slate-700 mb-2">Active Path:</label>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedPath('A')}
                                            className={`flex-1 px-3 py-2 rounded-md border transition-all text-sm font-medium ${
                                                selectedPath === 'A'
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                                            }`}
                                        >
                                            Path A {bestPath === 'A' && '⭐'}
                                        </button>
                                        <button
                                            onClick={() => setSelectedPath('B')}
                                            className={`flex-1 px-3 py-2 rounded-md border transition-all text-sm font-medium ${
                                                selectedPath === 'B'
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                                            }`}
                                        >
                                            Path B {bestPath === 'B' && '⭐'}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-300 rounded-lg shadow overflow-hidden">
                                    <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold">Breakdown</h3>
                                                <p className="text-xs text-slate-200">Path {selectedPath}</p>
                                            </div>
                                            <Receipt className="w-6 h-6 opacity-80" />
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        {expenses.length === 0 ? (
                                            <div className="text-center py-6 text-slate-500 text-sm">
                                                <p>No expenses added</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-12 gap-3 pb-2 border-b border-slate-200 text-xs font-semibold text-slate-600">
                                                    <div className="col-span-5">Item</div>
                                                    <div className="col-span-3 text-right">{inputCurrency}</div>
                                                    <div className="col-span-1 text-center"><ArrowRight className="w-3 h-3 mx-auto" /></div>
                                                    <div className="col-span-3 text-right">{resultCurrency}</div>
                                                </div>

                                                {expenses.map((expense, index) => {
                                                    const resultAmount = calculateItemCostInResultCurrency(expense.amount);
                                                    return (
                                                        <div key={expense.id} className={`grid grid-cols-12 gap-3 py-2 text-sm ${index !== expenses.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                                            <div className="col-span-5 font-medium text-slate-800">{expense.name}</div>
                                                            <div className="col-span-3 text-right text-slate-700">{expense.amount.toLocaleString()}</div>
                                                            <div className="col-span-1 text-center text-slate-400"><ArrowRight className="w-3 h-3 mx-auto" /></div>
                                                            <div className="col-span-3 text-right font-semibold text-blue-900">
                                                                {resultAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {expenses.length > 0 && (
                                            <div className="mt-4 pt-3 border-t-2 border-slate-300">
                                                <div className="grid grid-cols-12 gap-3">
                                                    <div className="col-span-5 text-sm font-bold text-slate-800">TOTAL</div>
                                                    <div className="col-span-3 text-right text-sm font-bold text-slate-800">
                                                        {targetTotal.toLocaleString()}
                                                    </div>
                                                    <div className="col-span-1"></div>
                                                    <div className="col-span-3 text-right text-xl font-bold text-blue-900">
                                                        {(selectedPath === 'A' ? pathA_Result : pathB_Result).toLocaleString(undefined, {maximumFractionDigits: 2})}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center py-4 bg-white rounded-lg shadow-sm">
                    <p className="text-slate-600 text-xs">All rights reserved {currentYear} © Wafiq M. Abdulrahman</p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default ReverseRemittancePlanner;
