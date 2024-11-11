import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  CheckCircle, 
  CreditCard, 
  Shield, 
  AlertTriangle,
  ArrowRight,
  RefreshCcw
} from 'lucide-react';

const FraudDetectionApp = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: parseFloat(e.target.value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setResult(result);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <Input
              type="number"
              name="Amount"
              step="0.01"
              required
              placeholder="Transaction amount"
              className="pl-8"
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Time</label>
          <Input
            type="number"
            name="Time"
            required
            placeholder="Seconds elapsed"
            onChange={handleInputChange}
          />
        </div>
      </div>
      <Button 
        onClick={() => setCurrentStep(2)} 
        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
      >
        Next Step <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(28)].map((_, i) => (
          <div key={i} className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">V{i + 1}</label>
            <Input
              type="number"
              name={`V${i + 1}`}
              step="0.000001"
              required
              placeholder={`V${i + 1}`}
              className="text-sm"
              onChange={handleInputChange}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={() => setCurrentStep(1)}
          variant="outline"
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
        >
          {loading ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              Analyzing
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Analyze Transaction
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    const isFraud = result.prediction === 1;
    const confidence = (result.probability * 100).toFixed(2);

    return (
      <div className={`mt-6 rounded-lg p-6 ${isFraud ? 'bg-red-50' : 'bg-green-50'} transition-all duration-500 ease-in-out`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {isFraud ? (
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            )}
            <div>
              <h3 className={`text-lg font-semibold ${isFraud ? 'text-red-700' : 'text-green-700'}`}>
                {isFraud ? 'Potential Fraud Detected' : 'Transaction Appears Safe'}
              </h3>
              <p className="text-sm text-gray-600">
                Confidence Level: {confidence}%
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full ${
            isFraud ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {isFraud ? 'High Risk' : 'Low Risk'}
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${isFraud ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {isFraud 
              ? 'This transaction shows patterns consistent with fraudulent activity.'
              : 'This transaction appears to be legitimate based on our analysis.'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Fraud Detection System
                </h2>
                <p className="text-gray-600">
                  Enter transaction details to analyze potential fraud
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center">
                {[1, 2].map((step) => (
                  <React.Fragment key={step}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    {step < 2 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">Basic Info</span>
                <span className="text-sm text-gray-600">Transaction Details</span>
              </div>
            </div>

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {renderResult()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FraudDetectionApp;