import { Injectable } from '@nestjs/common';

interface Contract {
  id: string;
  customerId: string;
  amount: number;
  status: 'active' | 'expired' | 'suspended';
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class BillingService {
  async createContract(data: {
    customerId: string;
    amount: number;
    startDate: Date;
    endDate: Date;
  }): Promise<Contract> {
    return {
      id: `contract-${Date.now()}`,
      customerId: data.customerId,
      amount: data.amount,
      status: 'active',
      startDate: data.startDate,
      endDate: data.endDate,
    };
  }

  async getContractStatus(contractId: string) {
    return {
      id: contractId,
      status: 'active',
      daysRemaining: 180,
      amountPaid: 5000,
      amountDue: 0,
      lastPaymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    };
  }

  async generateInvoice(contractId: string, period: { from: Date; to: Date }) {
    return {
      id: `inv-${Date.now()}`,
      contractId,
      period,
      amount: 1000,
      services: [
        { name: 'Support', hours: 160, rate: 50, total: 8000 },
      ],
      issued: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'pending',
    };
  }

  async recordPayment(contractId: string, amount: number, method: string) {
    return {
      id: `payment-${Date.now()}`,
      contractId,
      amount,
      method,
      status: 'confirmed',
      processedAt: new Date(),
    };
  }

  async suspendContract(contractId: string, reason: string) {
    return {
      contractId,
      status: 'suspended',
      reason,
      suspendedAt: new Date(),
    };
  }

  async getCustomerBillingHistory(customerId: string) {
    return {
      customerId,
      totalAmount: 12000,
      totalPaid: 10000,
      balance: 2000,
      invoices: 12,
      contracts: 1,
    };
  }
}
