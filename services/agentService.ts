// services/agentService.ts
import { AgentSpecialization, AgentType } from "../types";
import http from "./http";

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
      formData.append("type", type);
      formData.append("idCardNumber", idCardNumber);
      formData.append("taxId", taxId);
      if (companyName) formData.append("companyName", companyName);
      formData.append("bankName", bankName);
      formData.append("accountNumber", accountNumber);
      formData.append("accountHolder", accountHolder);
      formData.append("specialization", specialization);
      formData.append("idDocument", idDocument);

      await http.post("/agent/verification", formData, {
        headers: {},
      });
    } else {
      await http.post("/agent/verification", {
        type,
        idCardNumber,
        taxId,
        companyName,
        bankName,
        accountNumber,
        accountHolder,
        specialization,
      });
    }
  },

  async getMyVerification() {
    const res = await http.get("/agent/verification");
    return res.data?.data || null;
  },
};
