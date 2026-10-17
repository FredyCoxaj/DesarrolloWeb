import { Injectable, Logger } from '@nestjs/common';

export interface PncResponse {
  dpi: string;
  tieneAntecedentes: boolean;
  delitos: string[];
  verificadoEn: Date;
}

@Injectable()
export class PncService {
  private readonly logger = new Logger(PncService.name);

  /**
   * Mock de la API de la PNC de Guatemala.
   * En producción, esta función hará una llamada HTTP real a la API institucional.
   *
   * Reglas del mock:
   * - Cualquier DPI que empiece con "9" → tiene antecedentes
   * - Cualquier otro DPI → limpio
   */
  async verificarAntecedentes(dpi: string): Promise<PncResponse> {
    this.logger.log(` Verificando DPI en PNC: ${dpi}`);

    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Regla del mock: DPIs que empiezan con 9 tienen antecedentes
    const tieneAntecedentes = dpi.startsWith('9');

    const resultado: PncResponse = {
      dpi,
      tieneAntecedentes,
      delitos: tieneAntecedentes
        ? ['Delito simulado para pruebas - Art. 123 Código Penal']
        : [],
      verificadoEn: new Date(),
    };

    this.logger.log(
      ` Verificación PNC completada para ${dpi}: ${
        tieneAntecedentes ? ' CON ANTECEDENTES' : ' LIMPIO'
      }`,
    );

    return resultado;
  }
}