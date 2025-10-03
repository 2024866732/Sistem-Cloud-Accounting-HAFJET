// Malaysian Tax Service for SST and GST calculations
export class MalaysianTaxService {
  static calculateSST(amount: number, rate: number = 6): number {
    return amount * (rate / 100);
  }

  static calculateGST(amount: number, rate: number = 6): number {
    return amount * (rate / 100);
  }

  static getTaxCodeInfo(taxCode: string) {
    const taxCodes: Record<string, any> = {
      'TX-01': { name: 'SST Standard Rate', rate: 6, type: 'SST' },
      'TX-02': { name: 'GST Standard Rate', rate: 6, type: 'GST' },
      'TX-03': { name: 'Zero Rated', rate: 0, type: 'Zero' },
      'TX-04': { name: 'Exempt', rate: 0, type: 'Exempt' }
    };

    return taxCodes[taxCode] || null;
  }
}

export default MalaysianTaxService;