import * as moment from "moment-timezone";

export enum TipoCodigo {
  CODIGO_DE_BARRAS = "CODIGO_DE_BARRAS",
  LINHA_DIGITAVEL = "LINHA_DIGITAVEL",
  TAMANHO_INCORRETO = "TAMANHO_INCORRETO",
}

/**
 * Identifica o tipo de código inserido (se baseando na quantidade de dígitos).
 */
export const identificarTipoCodigo = (codigo: string): TipoCodigo => {
  if (typeof codigo !== "string")
    throw new TypeError("Insira uma string válida!");

  codigo = codigo.replace(/[^0-9]/g, "");

  if (codigo.length == 44) {
    return TipoCodigo.CODIGO_DE_BARRAS;
  } else if (
    codigo.length == 46 ||
    codigo.length == 47 ||
    codigo.length == 48
  ) {
    return TipoCodigo.LINHA_DIGITAVEL;
  } else {
    return TipoCodigo.TAMANHO_INCORRETO;
  }
};

export enum TipoBoleto {
  BANCO = "BANCO",
  ARRECADACAO_PREFEITURA = "ARRECADACAO_PREFEITURA",
  ARRECADACAO_ORGAOS_GOVERNAMENTAIS = "ARRECADACAO_ORGAOS_GOVERNAMENTAIS",
  ARRECADACAO_TAXAS_DE_TRANSITO = "ARRECADACAO_TAXAS_DE_TRANSITO",
  CONVENIO_SANEAMENTO = "CONVENIO_SANEAMENTO",
  CONVENIO_ENERGIA_ELETRICA_E_GAS = "CONVENIO_ENERGIA_ELETRICA_E_GAS",
  CONVENIO_TELECOMUNICACOES = "CONVENIO_TELECOMUNICACOES",
  OUTROS = "OUTROS",
  CARTAO_DE_CREDITO = "CARTAO_DE_CREDITO",
}

/**
 * Identifica o tipo de boleto inserido a partir da validação de seus dois dígitos iniciais.
 */
export const identificarTipoBoleto = (codigo: string) => {
  codigo = codigo.replace(/[^0-9]/g, "");

  if (typeof codigo !== "string")
    throw new TypeError("Insira uma string válida!");

  if (
    codigo.substr(-14) == "00000000000000" ||
    codigo.substr(5, 14) == "00000000000000"
  ) {
    return TipoBoleto.CARTAO_DE_CREDITO;
  } else if (codigo.substr(0, 1) == "8") {
    if (codigo.substr(1, 1) == "1") {
      return TipoBoleto.ARRECADACAO_PREFEITURA;
    } else if (codigo.substr(1, 1) == "2") {
      return TipoBoleto.CONVENIO_SANEAMENTO;
    } else if (codigo.substr(1, 1) == "3") {
      return TipoBoleto.CONVENIO_ENERGIA_ELETRICA_E_GAS;
    } else if (codigo.substr(1, 1) == "4") {
      return TipoBoleto.CONVENIO_TELECOMUNICACOES;
    } else if (codigo.substr(1, 1) == "5") {
      return TipoBoleto.ARRECADACAO_ORGAOS_GOVERNAMENTAIS;
    } else if (codigo.substr(1, 1) == "6" || codigo.substr(1, 1) == "9") {
      return TipoBoleto.OUTROS;
    } else if (codigo.substr(1, 1) == "7") {
      return TipoBoleto.ARRECADACAO_TAXAS_DE_TRANSITO;
    }
  } else {
    return TipoBoleto.BANCO;
  }
};

/**
 * Identifica o o código de referência do boleto para determinar qual módulo
 * será utilizado para calcular os dígitos verificadores
 */
export const identificarReferencia = (
  codigo: string
): {
  mod: number;
  efetivo: boolean;
} => {
  codigo = codigo.replace(/[^0-9]/g, "");

  const referencia = codigo.substr(2, 1);

  if (typeof codigo !== "string")
    throw new TypeError("Insira uma string válida!");

  switch (referencia) {
    case "6":
      return {
        mod: 10,
        efetivo: true,
      };
      break;
    case "7":
      return {
        mod: 10,
        efetivo: false,
      };
      break;
    case "8":
      return {
        mod: 11,
        efetivo: true,
      };
      break;
    case "9":
      return {
        mod: 11,
        efetivo: false,
      };
      break;
    default:
      throw new TypeError("Referecia não encontrada!");
      break;
  }
};

/**
 * Identifica o fator da data de vencimento do boleto
 */
export const identificarData = (
  codigo: string,
  tipoCodigo: TipoCodigo
): Date => {
  codigo = codigo.replace(/[^0-9]/g, "");
  const tipoBoleto = identificarTipoBoleto(codigo);

  let fatorData = "";
  let dataBoleto = moment.tz("1997-10-07 20:54:59.000Z", "UTC");

  if (tipoCodigo === TipoCodigo.CODIGO_DE_BARRAS) {
    if (
      tipoBoleto == TipoBoleto.BANCO ||
      tipoBoleto == TipoBoleto.CARTAO_DE_CREDITO
    ) {
      fatorData = codigo.substr(5, 4);
    } else {
      fatorData = "0";
    }
  } else if (tipoCodigo === TipoCodigo.LINHA_DIGITAVEL) {
    if (
      tipoBoleto == TipoBoleto.BANCO ||
      tipoBoleto == TipoBoleto.CARTAO_DE_CREDITO
    ) {
      fatorData = codigo.substr(33, 4);
    } else {
      fatorData = "0";
    }
  }

  dataBoleto.add(Number(fatorData), "days");

  return dataBoleto.toDate();
};

/**
 * Identifica o valor no CÓDIGO DE BARRAS do boleto do tipo 'Arrecadação'
 */
export const identificarValorCodBarrasArrecadacao = (
  codigo: string,
  tipoCodigo: TipoCodigo
) => {
  codigo = codigo.replace(/[^0-9]/g, "");
  const isValorEfetivo = identificarReferencia(codigo).efetivo;

  let valorBoleto = "";
  let valorFinal;

  if (isValorEfetivo) {
    if (tipoCodigo == "LINHA_DIGITAVEL") {
      valorBoleto = codigo.substr(4, 14);
      const valorBoletoArr = codigo.split("");
      valorBoletoArr.splice(11, 1);
      valorBoleto = valorBoletoArr.join("");
      valorBoleto = valorBoleto.substr(4, 11);
    } else if (tipoCodigo == "CODIGO_DE_BARRAS") {
      valorBoleto = codigo.substr(4, 11);
    }

    valorFinal =
      valorBoleto.substr(0, 9) + "." + valorBoleto.substr(9, 2);

    let char = valorFinal.substr(1, 1);
    while (char === "0") {
      valorFinal = substringReplace(valorFinal, "", 0, 1);
      char = valorFinal.substr(1, 1);
    }
  } else {
    valorFinal = 0;
  }

  return valorFinal;
};

/**
 * Identifica o valor no boleto inserido
 */
export const identificarValor = (codigo: string, tipoCodigo: TipoCodigo) => {
  const tipoBoleto = identificarTipoBoleto(codigo);

  let valorBoleto = "";
  let valorFinal = "";

  if (tipoCodigo == TipoCodigo.CODIGO_DE_BARRAS) {
    if (
      tipoBoleto == TipoBoleto.BANCO ||
      tipoBoleto == TipoBoleto.CARTAO_DE_CREDITO
    ) {
      valorBoleto = codigo.substr(9, 10);
      valorFinal =
        valorBoleto.substr(0, 8) + "." + valorBoleto.substr(8, 2);

      let char = valorFinal.substr(1, 1);
      while (char === "0") {
        valorFinal = substringReplace(valorFinal, "", 0, 1);
        char = valorFinal.substr(1, 1);
      }
    } else {
      valorFinal = identificarValorCodBarrasArrecadacao(
        codigo,
        TipoCodigo.CODIGO_DE_BARRAS
      ).toString();
    }
  } else if (tipoCodigo == TipoCodigo.LINHA_DIGITAVEL) {
    if (
      tipoBoleto == TipoBoleto.BANCO ||
      tipoBoleto == TipoBoleto.CARTAO_DE_CREDITO
    ) {
      valorBoleto = codigo.substr(37);
      valorFinal =
        valorBoleto.substr(0, 8) + "." + valorBoleto.substr(8, 2);

      let char = valorFinal.substr(1, 1);
      while (char === "0") {
        valorFinal = substringReplace(valorFinal, "", 0, 1);
        char = valorFinal.substr(1, 1);
      }
    } else {
      valorFinal = identificarValorCodBarrasArrecadacao(
        codigo,
        TipoCodigo.LINHA_DIGITAVEL
      ).toString();
    }
  }
  return parseFloat(valorFinal);
};

/**
 * Define qual módulo deverá ser utilizado para calcular os dígitos verificadores
 */
export const digitosVerificadores = (codigo: string, mod: 10 | 11) => {
  codigo = codigo.replace(/[^0-9]/g, "");
  switch (mod) {
    case 10:
      return (codigo + calculaMod10(codigo)).toString();
      break;
    case 11:
      return (codigo + calculaMod11(codigo)).toString();
      break;
    default:
      break;
  }
};

/**
 * Converte a numeração do código de barras em linha digitável
 */
export const codBarras2LinhaDigitavel = (
  codigo: string,
  formatada: boolean
) => {
  codigo = codigo.replace(/[^0-9]/g, "");

  const tipoBoleto = identificarTipoBoleto(codigo);

  let resultado = "";

  if (
    tipoBoleto == TipoBoleto.BANCO ||
    tipoBoleto == TipoBoleto.CARTAO_DE_CREDITO
  ) {
    const novaLinha =
      codigo.substr(0, 4) +
      codigo.substr(19, 25) +
      codigo.substr(4, 1) +
      codigo.substr(5, 14);

    const bloco1 =
      novaLinha.substr(0, 9) + calculaMod10(novaLinha.substr(0, 9));
    const bloco2 =
      novaLinha.substr(9, 10) + calculaMod10(novaLinha.substr(9, 10));
    const bloco3 =
      novaLinha.substr(19, 10) + calculaMod10(novaLinha.substr(19, 10));
    const bloco4 = novaLinha.substr(29);

    resultado = (bloco1 + bloco2 + bloco3 + bloco4).toString();

    if (formatada) {
      resultado =
        resultado.slice(0, 5) +
        "." +
        resultado.slice(5, 10) +
        " " +
        resultado.slice(10, 15) +
        "." +
        resultado.slice(15, 21) +
        " " +
        resultado.slice(21, 26) +
        "." +
        resultado.slice(26, 32) +
        " " +
        resultado.slice(32, 33) +
        " " +
        resultado.slice(33);
    }
  } else {
    const identificacaoValorRealOuReferencia = identificarReferencia(codigo);
    let bloco1: string = "";
    let bloco2: string = "";
    let bloco3: string = "";
    let bloco4: string = "";

    if (identificacaoValorRealOuReferencia.mod == 10) {
      bloco1 = codigo.substr(0, 11) + calculaMod10(codigo.substr(0, 11));
      bloco2 =
        codigo.substr(11, 11) + calculaMod10(codigo.substr(11, 11));
      bloco3 =
        codigo.substr(22, 11) + calculaMod10(codigo.substr(22, 11));
      bloco4 =
        codigo.substr(33, 11) + calculaMod10(codigo.substr(33, 11));
    } else if (identificacaoValorRealOuReferencia.mod == 11) {
      bloco1 = codigo.substr(0, 11) + calculaMod11(codigo.substr(0, 11));
      bloco2 =
        codigo.substr(11, 11) + calculaMod11(codigo.substr(11, 11));
      bloco3 =
        codigo.substr(22, 11) + calculaMod11(codigo.substr(22, 11));
      bloco4 =
        codigo.substr(33, 11) + calculaMod11(codigo.substr(33, 11));
    }

    resultado = bloco1 + bloco2 + bloco3 + bloco4;
  }

  return resultado;
};

/**
 * Converte a numeração da linha digitável em código de barras
 */
export const linhaDigitavel2CodBarras = (codigo: string) => {
  codigo = codigo.replace(/[^0-9]/g, "");

  const tipoBoleto = identificarTipoBoleto(codigo);

  let resultado = "";

  if (
    tipoBoleto == TipoBoleto.BANCO ||
    tipoBoleto == TipoBoleto.CARTAO_DE_CREDITO
  ) {
    resultado =
      codigo.substr(0, 4) +
      codigo.substr(32, 1) +
      codigo.substr(33, 14) +
      codigo.substr(4, 5) +
      codigo.substr(10, 10) +
      codigo.substr(21, 10);
  } else {
    const codArr = codigo.split("");
    codArr.splice(11, 1);
    codArr.splice(22, 1);
    codArr.splice(33, 1);
    codArr.splice(44, 1);
    codigo = codArr.join("");

    resultado = codigo;
  }

  return resultado;
};

/**
 * Calcula o dígito verificador de toda a numeração do código de barras
 */
export const calculaDVCodBarras = (
  codigo: string,
  posicaoCodigo: number,
  mod: number
) => {
  codigo = codigo.replace(/[^0-9]/g, "");

  const codArr = codigo.split("");
  codArr.splice(posicaoCodigo, 1);
  codigo = codArr.join("");

  if (mod === 10) {
    return calculaMod10(codigo);
  } else if (mod === 11) {
    return calculaMod11(codigo);
  }
};

/**
 * Informa se o código de barras inserido é válido, calculando seu dígito verificador.
 */
export const validarCodigoComDV = (codigo: string, tipoCodigo: TipoCodigo) => {
  codigo = codigo.replace(/[^0-9]/g, "");
  let tipoBoleto;

  let resultado;

  if (tipoCodigo === TipoCodigo.LINHA_DIGITAVEL) {
    tipoBoleto = identificarTipoBoleto(codigo);

    if (
      tipoBoleto == TipoBoleto.BANCO ||
      tipoBoleto == TipoBoleto.CARTAO_DE_CREDITO
    ) {
      const bloco1 =
        codigo.substr(0, 9) + calculaMod10(codigo.substr(0, 9));
      const bloco2 =
        codigo.substr(10, 10) + calculaMod10(codigo.substr(10, 10));
      const bloco3 =
        codigo.substr(21, 10) + calculaMod10(codigo.substr(21, 10));
      const bloco4 = codigo.substr(32, 1);
      const bloco5 = codigo.substr(33);

      resultado = (bloco1 + bloco2 + bloco3 + bloco4 + bloco5).toString();
    } else {
      const identificacaoValorRealOuReferencia = identificarReferencia(codigo);
      let bloco1: string = "";
      let bloco2: string = "";
      let bloco3: string = "";
      let bloco4: string = "";

      if (identificacaoValorRealOuReferencia.mod == 10) {
        bloco1 =
          codigo.substr(0, 11) + calculaMod10(codigo.substr(0, 11));
        bloco2 =
          codigo.substr(12, 11) + calculaMod10(codigo.substr(12, 11));
        bloco3 =
          codigo.substr(24, 11) + calculaMod10(codigo.substr(24, 11));
        bloco4 =
          codigo.substr(36, 11) + calculaMod10(codigo.substr(36, 11));
      } else if (identificacaoValorRealOuReferencia.mod == 11) {
        bloco1 = codigo.substr(0, 11);
        bloco2 = codigo.substr(12, 11);
        bloco3 = codigo.substr(24, 11);
        bloco4 = codigo.substr(36, 11);

        let dv1 = parseInt(codigo.substr(11, 1));
        let dv2 = parseInt(codigo.substr(23, 1));
        let dv3 = parseInt(codigo.substr(35, 1));
        let dv4 = parseInt(codigo.substr(47, 1));
        //console.log(dv1)
        //console.log(calculaMod11(bloco1))
        //console.log(dv2)
        //console.log(calculaMod11(bloco2))
        //console.log(dv3)
        //console.log(calculaMod11(bloco3))
        //console.log(dv4)
        //console.log(calculaMod11(bloco4))

        let valid =
          calculaMod11(bloco1) == dv1 &&
          calculaMod11(bloco2) == dv2 &&
          calculaMod11(bloco3) == dv3 &&
          calculaMod11(bloco4) == dv4;

        return valid;
      }

      resultado = bloco1 + bloco2 + bloco3 + bloco4;
    }
  } else if (tipoCodigo === TipoCodigo.CODIGO_DE_BARRAS) {
    tipoBoleto = identificarTipoBoleto(codigo);

    if (
      tipoBoleto == TipoBoleto.BANCO ||
      tipoBoleto == TipoBoleto.CARTAO_DE_CREDITO
    ) {
      const DV = calculaDVCodBarras(codigo, 4, 11);
      resultado = codigo.substr(0, 4) + DV + codigo.substr(5);
    } else {
      const identificacaoValorRealOuReferencia = identificarReferencia(codigo);

      resultado = codigo.split("");
      resultado.splice(3, 1);
      resultado = resultado.join("");

      const DV = calculaDVCodBarras(
        codigo,
        3,
        identificacaoValorRealOuReferencia.mod
      );
      resultado = resultado.substr(0, 3) + DV + resultado.substr(3);
    }
  }

  return codigo === resultado;
};

/**
 * Gerar código de barras já realizando o cálculo do dígito verificador
 */
export const geraCodBarras = (codigo: string) => {
  codigo = codigo.replace(/[^0-9]/g, "");

  const tipoBoleto = identificarTipoBoleto(codigo);

  let novoCodigo;

  novoCodigo = linhaDigitavel2CodBarras(codigo);
  novoCodigo = novoCodigo.split("");
  novoCodigo.splice(4, 1);
  novoCodigo = novoCodigo.join("");
  let dv = calculaMod11(novoCodigo);
  novoCodigo = novoCodigo.substr(0, 4) + dv + novoCodigo.substr(4);

  return novoCodigo;
};

/**
 * ## __`BOLETO COBRANÇA`__
 * ### __AS POSIÇÕES AQUI MENCIONADAS PARTEM DO NÚMERO 0 E NÃO DO 1, A FIM DE FACILITAR O ENTENDIMENTO LÓGICO__
 * ---------------------------------------------------------
 *
 * ### __TIPO:__ CÓDIGO DE BARRAS (44 POSIÇÕES NUMÉRICAS)
 *
 * ---------------------------------------------------------
 *
 * #### __EXEMPLO:__ 11123444455555555556666666666666666666666666
 *
 * Bloco | Posições | Definição
 * --- | --- | ---
 * __1__ | **0 a 2**  | `Código do Banco na Câmara de Compensação`
 * __2__ | **3 a 3**  | `Código da Moeda = 9 (Real)`
 * __3__ | **4 a 4**  | `Digito Verificador (DV) do código de Barras`
 * __4__ | **5 a 8**  | `Fator de Vencimento`
 * __5__ | **9 a 18**  | `Valor com 2 casas de centavos`
 * __6__ | **19 a 43**  | `Campo Livre (De uso da instituição bancária)`
 *
 * ---------------------------------------------------------
 *
 * ### __TIPO:__ LINHA DIGITÁVEL (47 POSIÇÕES NUMÉRICAS)
 *
 * ---------------------------------------------------------
 *
 * #### __EXEMPLO__: AAABC.CCCCX DDDDD.DDDDDY EEEEE.EEEEEZ K UUUUVVVVVVVVVV
 *
 * Campo | Posições linha dig. | Definição
 * --- | --- | ---
 * __A__ | **0 a 2** (0 a 2 do cód. barras)  | `Código do Banco na Câmara de compensação`
 * __B__ | **3 a 3** (3 a 3 do cód. barras)  | `Código da moeda`
 * __C__ | **4 a 8** (19 a 23 do cód. barras)  | `Campo Livre`
 * __X__ | **9 a 9**  | `Dígito verificador do Bloco 1 (Módulo 10)`
 * __D__ | **10 a 19** (24 a 33 do cód. barras)  | `Campo Livre`
 * __Y__ | **20 a 20**  | `Dígito verificador do Bloco 2 (Módulo 10)`
 * __E__ | **21 a 30** (24 a 43 do cód. barras)  | `Campo Livre`
 * __Z__ | **31 a 31**  | `Dígito verificador do Bloco 3 (Módulo 10)`
 * __K__ | **32 a 32** (4 a 4 do cód. barras)  | `Dígito verificador do código de barras`
 * __U__ | **33 a 36** (5 a 8 do cód. barras)  | `Fator de Vencimento`
 * __V__ | **37 a 43** (9 a 18 do cód. barras)  | `Valor`
 *
 * ## __`CONTA CONVÊNIO / ARRECADAÇÃO`__
 *
 * ---------------------------------------------------------
 *
 * ### __TIPO:__ CÓDIGO DE BARRAS (44 POSIÇÕES NUMÉRICAS)
 *
 * ---------------------------------------------------------
 *
 * #### __EXEMPLO__: 12345555555555566667777777777777777777777777
 *
 * Campo | Posições | Definição
 * --- | --- | ---
 * __1__ | **0 a 0**  | `"8" Identificação da Arrecadação/convênio`
 * __2__ | **1 a 1**  | `Identificação do segmento`
 * __3__ | **2 a 2**  | `Identificação do valor real ou referência`
 * __4__ | **3 a 3**  | `Dígito verificador geral (módulo 10 ou 11)`
 * __5__ | **4 a 14**  | `Valor efetivo ou valor referência`
 * __6__ | **15 a 18**  | `Identificação da empresa/órgão`
 * __7__ | **19 a 43**  | `Campo livre de utilização da empresa/órgão`
 *
 * ---------------------------------------------------------
 *
 * ### __TIPO:__ LINHA DIGITÁVEL (48 POSIÇÕES NUMÉRICAS)
 *
 * ---------------------------------------------------------
 *
 * #### __EXEMPLO__: ABCDEEEEEEE-W EEEEFFFFGGG-X GGGGGGGGGGG-Y GGGGGGGGGGG-Z
 *
 * Campo | Posições | Definição
 * --- | --- | ---
 * __A__ | **0 a 0**  | `"8" Identificação da Arrecadação/convênio`
 * __B__ | **1 a 1**  | `Identificação do segmento`
 * __C__ | **2 a 2**  | `Identificação do valor real ou referência`
 * __D__ | **3 a 3**  | `Dígito verificador geral (módulo 10 ou 11)`
 * __E__ | **4 a 14**  | `Valor efetivo ou valor referência`
 * __W__ | **11 a 11**  | `Dígito verificador do Bloco 1`
 * __F__ | **15 a 18**  | `Identificação da empresa/órgão`
 * __G__ | **19 a 43**  | `Campo livre de utilização da empresa/órgão`
 * __X__ | **23 a 23**  | `Dígito verificador do Bloco 2`
 * __Y__ | **35 a 35**  | `Dígito verificador do Bloco 3`
 * __Z__ | **47 a 47**  | `Dígito verificador do Bloco 4`
 */
export const validarBoleto = (codigo: string) => {
  let tipoCodigo = identificarTipoCodigo(codigo);

  let retorno: Record<string, any> = {};
  codigo = codigo.replace(/[^0-9]/g, "");

  /**
   * Boletos de cartão de crédito geralmente possuem 46 dígitos. É necessário adicionar mais um zero no final, para formar 47 caracteres
   * Alguns boletos de cartão de crédito do Itaú possuem 36 dígitos. É necessário acrescentar 11 zeros no final.
   */
  if (codigo.length == 36) {
    codigo = codigo + "00000000000";
  } else if (codigo.length == 46) {
    codigo = codigo + "0";
  }

  if (
    codigo.length != 44 &&
    codigo.length != 46 &&
    codigo.length != 47 &&
    codigo.length != 48
  ) {
    retorno.sucesso = false;
    retorno.codigoInput = codigo;
    retorno.mensagem =
      "O código inserido possui " +
      codigo.length +
      " dígitos. Por favor insira uma numeração válida. Códigos de barras SEMPRE devem ter 44 caracteres numéricos. Linhas digitáveis podem possuir 46 (boletos de cartão de crédito), 47 (boletos bancários/cobrança) ou 48 (contas convênio/arrecadação) caracteres numéricos. Qualquer caractere não numérico será desconsiderado.";
  } else if (
    codigo.substr(0, 1) == "8" &&
    codigo.length !== 44 &&
    codigo.length !== 48
  ) {
    retorno.sucesso = false;
    retorno.codigoInput = codigo;
    retorno.mensagem =
      "Este tipo de boleto deve possuir um código de barras 44 caracteres numéricos. Ou linha digitável de 48 caracteres numéricos.";
  } else if (!validarCodigoComDV(codigo, tipoCodigo)) {
    retorno.sucesso = false;
    retorno.codigoInput = codigo;
    retorno.mensagem =
      "A validação do dígito verificador falhou. Tem certeza que inseriu a numeração correta?";
  } else {
    retorno.sucesso = true;
    retorno.codigoInput = codigo;
    retorno.mensagem = "Boleto válido";

    switch (tipoCodigo) {
      case "LINHA_DIGITAVEL":
        retorno.tipoCodigoInput = "LINHA_DIGITAVEL";
        retorno.tipoBoleto = identificarTipoBoleto(codigo);
        retorno.codigoBarras = linhaDigitavel2CodBarras(codigo);
        retorno.linhaDigitavel = codigo;
        retorno.vencimento = identificarData(
          codigo,
          TipoCodigo.LINHA_DIGITAVEL
        );
        retorno.valor = identificarValor(codigo, TipoCodigo.LINHA_DIGITAVEL);
        break;
      case "CODIGO_DE_BARRAS":
        retorno.tipoCodigoInput = "CODIGO_DE_BARRAS";
        retorno.tipoBoleto = identificarTipoBoleto(codigo);
        retorno.codigoBarras = codigo;
        retorno.linhaDigitavel = codBarras2LinhaDigitavel(codigo, false);
        retorno.vencimento = identificarData(
          codigo,
          TipoCodigo.CODIGO_DE_BARRAS
        );
        retorno.valor = identificarValor(codigo, TipoCodigo.CODIGO_DE_BARRAS);
        break;
      default:
        break;
    }
  }

  return retorno;
};

/**
 * Calcula o dígito verificador de uma numeração a partir do módulo 10
 */
export const calculaMod10 = (numero: string) => {
  numero = numero.replace(/\D/g, "");
  var i;
  var mult = 2;
  var soma = 0;
  var s = "";

  for (i = numero.length - 1; i >= 0; i--) {
    s = mult * parseInt(numero.charAt(i)) + s;
    if (--mult < 1) {
      mult = 2;
    }
  }
  for (i = 0; i < s.length; i++) {
    soma = soma + parseInt(s.charAt(i));
  }
  soma = soma % 10;
  if (soma != 0) {
    soma = 10 - soma;
  }
  return soma;
};

/**
 * Calcula o dígito verificador de uma numeração a partir do módulo 11
 */
export const calculaMod11 = (x: string) => {
  let sequencia = [4, 3, 2, 9, 8, 7, 6, 5];
  let digit = 0;
  let j = 0;
  let DAC = 0;

  //FEBRABAN https://cmsportal.febraban.org.br/Arquivos/documentos/PDF/Layout%20-%20C%C3%B3digo%20de%20Barras%20-%20Vers%C3%A3o%205%20-%2001_08_2016.pdf
  for (var i = 0; i < x.length; i++) {
    let mult = sequencia[j];
    j++;
    j %= sequencia.length;
    digit += mult * parseInt(x.charAt(i));
  }

  DAC = digit % 11;

  if (DAC == 0 || DAC == 1) return 0;
  if (DAC == 10) return 1;

  return 11 - DAC;
};

/**
 * Função auxiliar para remover os zeros à esquerda dos valores detectados no código inserido
 */
function substringReplace(
  str: string,
  repl: string,
  inicio: number,
  tamanho: number
) {
  if (inicio < 0) {
    inicio = inicio + str.length;
  }

  tamanho = tamanho !== undefined ? tamanho : str.length;
  if (tamanho < 0) {
    tamanho = tamanho + str.length - inicio;
  }

  return [
    str.slice(0, inicio),
    repl.substr(0, tamanho),
    repl.slice(tamanho),
    str.slice(inicio + tamanho),
  ].join("");
}
