import { AgentSpecialization, AgentType } from '../types';
import http from './http';

export interface VerifyAgentPayload {
  type: AgentType;
  idCardNumber: string;
  taxId: string;
  companyName?: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  specialization: AgentSpecialization;
  idDocument?: File | null;
}

export const agentService = {
  async submitVerification(payload: VerifyAgentPayload): Promise<void> {
    const {
      idDocument,
      type,
      idCardNumber,
      taxId,
      companyName,
      bankName,
      accountNumber,
      accountHolder,
      specialization,
    } = payload;

    if (idDocument) {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('id_card_number', idCardNumber);
      formData.append('tax_id', taxId);
      if (companyName) formData.append('company_name', companyName);
      formData.append('bank_name', bankName);
      formData.append('bank_account_number', accountNumber);
      formData.append('bank_account_holder', accountHolder);
      formData.append('specialization', specialization);
      formData.append('id_document', idDocument);

      await http.post('/agent/verification', formData, {
        headers: {},
      });
    } else {
      await http.post('/agent/verification', {
        type: type,
        id_card_number: idCardNumber,
        tax_id: taxId,
        company_name: companyName,
        bank_name: bankName,
        bank_account_number: accountNumber,
        bank_account_holder: accountHolder,
        specialization: specialization,
      });
    }
  },

  async getMyVerification() {
    const res = await http.get('/agent/verification');
    return res.data;
  },
};
