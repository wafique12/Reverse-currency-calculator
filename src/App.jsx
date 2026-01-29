import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Landmark, TrendingDown, Award, Edit2, Receipt, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const ReverseRemittancePlanner = () => {
    // Initialize state from localStorage or use defaults
    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem('remittance-expenses');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'School Fees', amount: 50000 },
            { id: 2, name: 'Rent', amount: 30000 }
        ];
    });

    const [rates, setRates] = useState(() => {
        const saved = localStorage.getItem('remittance-rates');
        return saved ? JSON.parse(saved) : {
            rajhiSarToEgp: 13.5,
            nbeUsdToEgp: 50.5,
            rajhiUsdToSar: 3.75
        };
    });

    const [bankNames, setBankNames] = useState(() => {
        const saved = localStorage.getItem('remittance-bank-names');
        return saved ? JSON.parse(saved) : {
            sendingBank: 'Al Rajhi',
            receivingBank: 'NBE',
            currencyFrom: 'SAR',
            currencyTo: 'EGP',
            currencyBridge: 'USD'
        };
    });

    const [selectedPath, setSelectedPath] = useState(() => {
        const saved = localStorage.getItem('remittance-selected-path');
        return saved || 'A';
    });

    const [showBreakdown, setShowBreakdown] = useState(() => {
        const saved = localStorage.getItem('remittance-show-breakdown');
        return saved ? JSON.parse(saved) : false;
    });

    const [newExpenseName, setNewExpenseName] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState('');
    const [editingBank, setEditingBank] = useState(null);
    const [tempBankName, setTempBankName] = useState('');

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('remittance-expenses', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('remittance-rates', JSON.stringify(rates));
    }, [rates]);

    useEffect(() => {
        localStorage.setItem('remittance-bank-names', JSON.stringify(bankNames));
    }, [bankNames]);

    useEffect(() => {
        localStorage.setItem('remittance-selected-path', selectedPath);
    }, [selectedPath]);

    useEffect(() => {
        localStorage.setItem('remittance-show-breakdown', JSON.stringify(showBreakdown));
    }, [showBreakdown]);

    // Calculate target total in EGP
    const targetTotalEgp = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Calculate Path A: Direct SAR to EGP (Al Rajhi SAR-to-EGP rate)
    const pathA_SAR = rates.rajhiSarToEgp > 0 ? targetTotalEgp / rates.rajhiSarToEgp : 0;

    // Calculate Path B: USD Bridge (buy USD in KSA, sell for EGP in Egypt)
    const usdNeeded = rates.nbeUsdToEgp > 0 ? targetTotalEgp / rates.nbeUsdToEgp : 0;
    const pathB_SAR = usdNeeded * rates.rajhiUsdToSar;

    // Determine best path
    const bestPath = pathA_SAR > 0 && pathB_SAR > 0 
        ? (pathA_SAR < pathB_SAR ? 'A' : 'B')
        : null;
    const savings = bestPath ? Math.abs(pathA_SAR - pathB_SAR) : 0;

    // Calculate individual item costs in SAR based on selected path
    const calculateItemCostInSAR = (itemAmountEgp) => {
        if (selectedPath === 'A') {
            // Path A: Direct SAR to EGP
            return rates.rajhiSarToEgp > 0 ? itemAmountEgp / rates.rajhiSarToEgp : 0;
        } else {
            // Path B: USD Bridge
            const usdForItem = rates.nbeUsdToEgp > 0 ? itemAmountEgp / rates.nbeUsdToEgp : 0;
            return usdForItem * rates.rajhiUsdToSar;
        }
    };

    const addExpense = () => {
        if (newExpenseName.trim() && newExpenseAmount) {
            const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
            setExpenses([...expenses, {
                id: newId,
                name: newExpenseName.trim(),
                amount: parseFloat(newExpenseAmount) || 0
            }]);
            setNewExpenseName('');
            setNewExpenseAmount('');
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

    const updateRate = (field, value) => {
        setRates({ ...rates, [field]: parseFloat(value) || 0 });
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

    // Get current year
    const currentYear = new Date().getFullYear();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-t-2xl p-6 md:p-8 text-white shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Landmark className="w-8 h-8" />
                        <h1 className="text-3xl md:text-4xl font-bold">Remit Balance</h1>
                    </div>
                    <p className="text-blue-100 text-sm md:text-base">Calculate the optimal currency exchange path for your {bankNames.currencyTo} expenses</p>
                </div>

                <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-8">
                    {/* Expenses Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <TrendingDown className="w-6 h-6 text-blue-600" />
                            Monthly Expenses ({bankNames.currencyTo})
                        </h2>
                        
                        <div className="space-y-3 mb-4">
                            {expenses.map((expense) => (
                                <div key={expense.id} className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <input
                                        type="text"
                                        value={expense.name}
                                        onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                                        placeholder="Expense name"
                                    />
                                    <input
                                        type="number"
                                        value={expense.amount}
                                        onChange={(e) => updateExpense(expense.id, 'amount', e.target.value)}
                                        className="w-32 md:w-40 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                                        placeholder="Amount"
                                    />
                                    <button
                                        onClick={() => removeExpense(expense.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add New Expense */}
                        <div className="flex gap-3 items-center">
                            <input
                                type="text"
                                value={newExpenseName}
                                onChange={(e) => setNewExpenseName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addExpense()}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                                placeholder="New expense name"
                            />
                            <input
                                type="number"
                                value={newExpenseAmount}
                                onChange={(e) => setNewExpenseAmount(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addExpense()}
                                className="w-32 md:w-40 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                                placeholder="Amount"
                            />
                            <button
                                onClick={addExpense}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Add
                            </button>
                        </div>

                        {/* Total */}
                        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-slate-700">Target Total:</span>
                                <span className="text-3xl font-bold text-blue-900">{targetTotalEgp.toLocaleString()} {bankNames.currencyTo}</span>
                            </div>
                        </div>
                    </div>

                    {/* Exchange Rates Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Exchange Rates</h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Sending Bank (Al Rajhi) */}
                            <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl p-5">
                                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                                    <Landmark className="w-5 h-5" />
                                    {editingBank === 'sendingBank' ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={tempBankName}
                                                onChange={(e) => setTempBankName(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') saveBank();
                                                    if (e.key === 'Escape') cancelEditBank();
                                                }}
                                                className="px-2 py-1 border border-green-400 rounded text-sm flex-1 text-slate-900"
                                                autoFocus
                                            />
                                            <button onClick={saveBank} className="text-xs bg-green-600 text-white px-2 py-1 rounded">✓</button>
                                            <button onClick={cancelEditBank} className="text-xs bg-gray-400 text-white px-2 py-1 rounded">✗</button>
                                        </div>
                                    ) : (
                                        <>
                                            {bankNames.sendingBank} (KSA)
                                            <button onClick={() => startEditingBank('sendingBank')} className="ml-auto">
                                                <Edit2 className="w-4 h-4 text-green-700 hover:text-green-900" />
                                            </button>
                                        </>
                                    )}
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">
                                            {bankNames.currencyFrom} to {bankNames.currencyTo} (Direct Transfer)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={rates.rajhiSarToEgp}
                                            onChange={(e) => updateRate('rajhiSarToEgp', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">
                                            {bankNames.currencyBridge} to {bankNames.currencyFrom} (Sell Rate)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={rates.rajhiUsdToSar}
                                            onChange={(e) => updateRate('rajhiUsdToSar', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Receiving Bank (NBE Egypt) */}
                            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-5">
                                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                                    <Landmark className="w-5 h-5" />
                                    {editingBank === 'receivingBank' ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={tempBankName}
                                                onChange={(e) => setTempBankName(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') saveBank();
                                                    if (e.key === 'Escape') cancelEditBank();
                                                }}
                                                className="px-2 py-1 border border-blue-400 rounded text-sm flex-1 text-slate-900"
                                                autoFocus
                                            />
                                            <button onClick={saveBank} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">✓</button>
                                            <button onClick={cancelEditBank} className="text-xs bg-gray-400 text-white px-2 py-1 rounded">✗</button>
                                        </div>
                                    ) : (
                                        <>
                                            {bankNames.receivingBank} (Egypt)
                                            <button onClick={() => startEditingBank('receivingBank')} className="ml-auto">
                                                <Edit2 className="w-4 h-4 text-blue-700 hover:text-blue-900" />
                                            </button>
                                        </>
                                    )}
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">
                                        {bankNames.currencyBridge} to {bankNames.currencyTo} (Buy Rate)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={rates.nbeUsdToEgp}
                                        onChange={(e) => updateRate('nbeUsdToEgp', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Comparison Results</h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Path A: SAR Direct */}
                            <div className={`relative rounded-xl p-6 border-2 transition-all ${
                                bestPath === 'A' 
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-lg' 
                                    : 'bg-white border-slate-200'
                            }`}>
                                {bestPath === 'A' && (
                                    <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                                        <Award className="w-4 h-4" />
                                        Best Value
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Path A: {bankNames.currencyFrom} Direct</h3>
                                <p className="text-sm text-slate-600 mb-4">Send {bankNames.currencyFrom} → {bankNames.sendingBank} converts to {bankNames.currencyTo}</p>
                                <div className="bg-white rounded-lg p-4 border border-slate-200">
                                    <div className="text-sm text-slate-500 mb-1">You need to send:</div>
                                    <div className="text-3xl font-bold text-blue-900">{pathA_SAR.toLocaleString(undefined, {maximumFractionDigits: 2})} {bankNames.currencyFrom}</div>
                                </div>
                                <div className="mt-3 text-xs text-slate-500">
                                    Calculation: {targetTotalEgp.toLocaleString()} {bankNames.currencyTo} ÷ {rates.rajhiSarToEgp} = {pathA_SAR.toLocaleString(undefined, {maximumFractionDigits: 2})} {bankNames.currencyFrom}
                                </div>
                            </div>

                            {/* Path B: USD Bridge */}
                            <div className={`relative rounded-xl p-6 border-2 transition-all ${
                                bestPath === 'B' 
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-lg' 
                                    : 'bg-white border-slate-200'
                            }`}>
                                {bestPath === 'B' && (
                                    <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                                        <Award className="w-4 h-4" />
                                        Best Value
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Path B: {bankNames.currencyBridge} Bridge</h3>
                                <p className="text-sm text-slate-600 mb-4">Buy {bankNames.currencyBridge} in KSA → Sell for {bankNames.currencyTo} in Egypt</p>
                                <div className="bg-white rounded-lg p-4 border border-slate-200">
                                    <div className="text-sm text-slate-500 mb-1">You need to send:</div>
                                    <div className="text-3xl font-bold text-blue-900">{pathB_SAR.toLocaleString(undefined, {maximumFractionDigits: 2})} {bankNames.currencyFrom}</div>
                                </div>
                                <div className="mt-3 text-xs text-slate-500">
                                    Calculation: ({targetTotalEgp.toLocaleString()} {bankNames.currencyTo} ÷ {rates.nbeUsdToEgp}) × {rates.rajhiUsdToSar} = {pathB_SAR.toLocaleString(undefined, {maximumFractionDigits: 2})} {bankNames.currencyFrom}
                                </div>
                            </div>
                        </div>

                        {/* Savings Summary */}
                        {bestPath && savings > 0 && (
                            <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-5 text-white">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div>
                                        <div className="text-sm opacity-90">Savings with Path {bestPath}:</div>
                                        <div className="text-3xl font-bold">{savings.toLocaleString(undefined, {maximumFractionDigits: 2})} {bankNames.currencyFrom}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm opacity-90">Cost Difference:</div>
                                        <div className="text-xl font-semibold">{((savings / Math.max(pathA_SAR, pathB_SAR)) * 100).toFixed(2)}% cheaper</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detailed Breakdown Section - Collapsible */}
                    <div>
                        {/* Toggle Button */}
                        <button
                            onClick={() => setShowBreakdown(!showBreakdown)}
                            className="w-full flex items-center justify-between bg-gradient-to-r from-slate-700 to-slate-600 text-white p-4 rounded-xl shadow-lg hover:from-slate-800 hover:to-slate-700 transition-all mb-4"
                        >
                            <div className="flex items-center gap-3">
                                <Receipt className="w-6 h-6" />
                                <h2 className="text-2xl font-bold">Detailed Breakdown</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm opacity-90">
                                    {showBreakdown ? 'Hide' : 'Show'} Details
                                </span>
                                {showBreakdown ? (
                                    <ChevronUp className="w-6 h-6" />
                                ) : (
                                    <ChevronDown className="w-6 h-6" />
                                )}
                            </div>
                        </button>

                        {/* Collapsible Content */}
                        {showBreakdown && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Path Selection Toggle */}
                                <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl p-4">
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">Active Conversion Path:</label>
                                    <div className="flex gap-4 flex-wrap">
                                        <button
                                            onClick={() => setSelectedPath('A')}
                                            className={`flex-1 min-w-[200px] px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                                                selectedPath === 'A'
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <span>Path A: {bankNames.currencyFrom} Direct</span>
                                                {bestPath === 'A' && <Award className="w-4 h-4" />}
                                            </div>
                                            <div className="text-xs mt-1 opacity-80">
                                                Rate: {rates.rajhiSarToEgp} {bankNames.currencyFrom}/{bankNames.currencyTo}
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setSelectedPath('B')}
                                            className={`flex-1 min-w-[200px] px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                                                selectedPath === 'B'
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <span>Path B: {bankNames.currencyBridge} Bridge</span>
                                                {bestPath === 'B' && <Award className="w-4 h-4" />}
                                            </div>
                                            <div className="text-xs mt-1 opacity-80">
                                                Via {bankNames.currencyBridge}
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Invoice/Receipt Style Breakdown */}
                                <div className="bg-white border-2 border-slate-300 rounded-xl shadow-lg overflow-hidden">
                                    {/* Receipt Header */}
                                    <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold">Cost Breakdown</h3>
                                                <p className="text-xs text-slate-200">
                                                    Using: Path {selectedPath} - {selectedPath === 'A' ? `${bankNames.currencyFrom} Direct` : `${bankNames.currencyBridge} Bridge`}
                                                </p>
                                            </div>
                                            <Receipt className="w-8 h-8 opacity-80" />
                                        </div>
                                    </div>

                                    {/* Receipt Items */}
                                    <div className="p-6">
                                        {expenses.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500">
                                                <p>No expenses added yet</p>
                                                <p className="text-sm mt-2">Add expenses above to see the breakdown</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {/* Table Header */}
                                                <div className="grid grid-cols-12 gap-4 pb-3 border-b-2 border-slate-200 text-sm font-semibold text-slate-600">
                                                    <div className="col-span-5">Item</div>
                                                    <div className="col-span-3 text-right">{bankNames.currencyTo} Amount</div>
                                                    <div className="col-span-1 text-center">
                                                        <ArrowRight className="w-4 h-4 mx-auto" />
                                                    </div>
                                                    <div className="col-span-3 text-right">{bankNames.currencyFrom} Cost</div>
                                                </div>

                                                {/* Table Rows */}
                                                {expenses.map((expense, index) => {
                                                    const sarCost = calculateItemCostInSAR(expense.amount);
                                                    return (
                                                        <div 
                                                            key={expense.id} 
                                                            className={`grid grid-cols-12 gap-4 py-3 ${
                                                                index !== expenses.length - 1 ? 'border-b border-slate-100' : ''
                                                            }`}
                                                        >
                                                            <div className="col-span-5 font-medium text-slate-800">
                                                                {expense.name}
                                                            </div>
                                                            <div className="col-span-3 text-right text-slate-700">
                                                                {expense.amount.toLocaleString()} {bankNames.currencyTo}
                                                            </div>
                                                            <div className="col-span-1 text-center text-slate-400">
                                                                <ArrowRight className="w-4 h-4 mx-auto" />
                                                            </div>
                                                            <div className="col-span-3 text-right font-semibold text-blue-900">
                                                                {sarCost.toLocaleString(undefined, {maximumFractionDigits: 2})} {bankNames.currencyFrom}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Total Section */}
                                        {expenses.length > 0 && (
                                            <div className="mt-6 pt-4 border-t-2 border-slate-300">
                                                <div className="grid grid-cols-12 gap-4">
                                                    <div className="col-span-5 text-lg font-bold text-slate-800">
                                                        TOTAL
                                                    </div>
                                                    <div className="col-span-3 text-right text-lg font-bold text-slate-800">
                                                        {targetTotalEgp.toLocaleString()} {bankNames.currencyTo}
                                                    </div>
                                                    <div className="col-span-1"></div>
                                                    <div className="col-span-3 text-right text-2xl font-bold text-blue-900">
                                                        {(selectedPath === 'A' ? pathA_SAR : pathB_SAR).toLocaleString(undefined, {maximumFractionDigits: 2})} {bankNames.currencyFrom}
                                                    </div>
                                                </div>

                                                {/* Conversion Details */}
                                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                    <p className="text-sm text-slate-600 font-medium mb-2">Conversion Details:</p>
                                                    {selectedPath === 'A' ? (
                                                        <p className="text-xs text-slate-500">
                                                            Using {bankNames.sendingBank} direct transfer at {rates.rajhiSarToEgp} {bankNames.currencyFrom}/{bankNames.currencyTo}
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-slate-500">
                                                            Buying {bankNames.currencyBridge} at {rates.rajhiUsdToSar} {bankNames.currencyFrom}/{bankNames.currencyBridge}, 
                                                            selling for {bankNames.currencyTo} at {rates.nbeUsdToEgp} {bankNames.currencyBridge}/{bankNames.currencyTo}
                                                        </p>
                                                    )}
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
                <div className="mt-8 text-center py-6 bg-white rounded-xl shadow-md">
                    <p className="text-slate-600 text-sm">
                        All rights reserved {currentYear} © Wafiq M. Abdulrahman
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ReverseRemittancePlanner;