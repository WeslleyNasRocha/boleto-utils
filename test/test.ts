import * as boleto from "../src/boleto-utils";

describe("Boleto Inválido", function () {
  describe("Caracteres Inválidos", function () {
    it("deve retornar Objeto com {sucesso: false}", function () {
      expect(boleto.validarBoleto("jiuajs")).toHaveProperty("sucesso", false);
    });
  });
  describe("Fora do limite de caracteres", function () {
    it("deve retornar Objeto com {sucesso: false}", function () {
      expect(boleto.validarBoleto("1234")).toHaveProperty("sucesso", false);
      expect(
        boleto.validarBoleto(
          "123482938102381039810293810938093819023810982309182301238109238109328091"
        )
      ).toHaveProperty("sucesso", false);
    });
  });
});

describe("Boletos de 5 campos", function () {
  describe("Boleto Bancário", function () {
    describe("Código de barras", function () {
      it("deve retornar Objeto com informações do boleto", function () {
        const result = boleto.validarBoleto(
          "10499898100000214032006561000100040099726390"
        );
        expect(result).toHaveProperty("sucesso", true);
        expect(result).toHaveProperty("mensagem", "Boleto válido");
        expect(result).toHaveProperty("valor", 214.03);
        expect(result).toHaveProperty("tipoCodigoInput", "CODIGO_DE_BARRAS");
        expect(result).toHaveProperty("tipoBoleto", "BANCO");
        expect(result).toHaveProperty(
          "codigoBarras",
          "10499898100000214032006561000100040099726390"
        );
        expect(result).toHaveProperty(
          "linhaDigitavel",
          "10492006506100010004200997263900989810000021403"
        );
        expect(result).toHaveProperty("vencimento");
        expect(result.vencimento).toEqual(new Date("2022-05-10T20:54:59.000Z"));
      });
    });
    describe("Linha Digitável", function () {
      it("deve retornar Objeto com informações do boleto", function () {
        const result = boleto.validarBoleto(
          "10492006506100010004200997263900989810000021403"
        );
        expect(result).toHaveProperty("sucesso", true);
        expect(result).toHaveProperty("mensagem", "Boleto válido");
        expect(result).toHaveProperty("valor", 214.03);
        expect(result).toHaveProperty("tipoCodigoInput", "LINHA_DIGITAVEL");

        expect(result).toHaveProperty("tipoBoleto", "BANCO");
        expect(result).toHaveProperty(
          "codigoBarras",
          "10499898100000214032006561000100040099726390"
        );

        expect(result).toHaveProperty(
          "linhaDigitavel",
          "10492006506100010004200997263900989810000021403"
        );

        expect(result).toHaveProperty("vencimento");
        expect(result.vencimento).toEqual(new Date("2022-05-10T20:54:59.000Z"));
      });
    });
  });
  describe("Boleto de Cartão de Crédito", function () {
    describe("Código de barras", function () {
      it("deve retornar Objeto com informações do boleto", function () {
        const result = boleto.validarBoleto(
          "23797000000000000004150090019801673500021140"
        );
        expect(result).toHaveProperty("sucesso", true);
        expect(result).toHaveProperty("mensagem", "Boleto válido");
        expect(result).toHaveProperty("valor", 0);
        expect(result).toHaveProperty("tipoCodigoInput", "CODIGO_DE_BARRAS");

        expect(result).toHaveProperty("tipoBoleto", "CARTAO_DE_CREDITO");

        expect(result).toHaveProperty(
          "codigoBarras",
          "23797000000000000004150090019801673500021140"
        );

        expect(result).toHaveProperty(
          "linhaDigitavel",
          "23794150099001980167035000211405700000000000000"
        );
      });
    });
    describe("Linha Digitável", function () {
      it("deve retornar Objeto com informações do boleto", function () {
        const result = boleto.validarBoleto(
          "23794150099001980167035000211405700000000000000"
        );
        expect(result).toHaveProperty("sucesso", true);
        expect(result).toHaveProperty("mensagem", "Boleto válido");
        expect(result).toHaveProperty("valor", 0);
        expect(result).toHaveProperty("tipoCodigoInput", "LINHA_DIGITAVEL");

        expect(result).toHaveProperty("tipoBoleto", "CARTAO_DE_CREDITO");

        expect(result).toHaveProperty(
          "codigoBarras",
          "23797000000000000004150090019801673500021140"
        );

        expect(result).toHaveProperty(
          "linhaDigitavel",
          "23794150099001980167035000211405700000000000000"
        );
      });
    });
  });
});

describe("Boletos de 4 campos", function () {
  describe("Código de barras", function () {
    it("deve retornar Objeto com informações do boleto", function () {
      const result = boleto.validarBoleto(
        "83860000005096000190000008017823000034306271"
      );
      expect(result).toHaveProperty("sucesso", true);
      expect(result).toHaveProperty("sucesso", true);
      expect(result).toHaveProperty("mensagem", "Boleto válido");
      expect(result).toHaveProperty("valor", 509.6);
      expect(result).toHaveProperty("tipoCodigoInput", "CODIGO_DE_BARRAS");

      expect(result).toHaveProperty(
        "tipoBoleto",
        "CONVENIO_ENERGIA_ELETRICA_E_GAS"
      );

      expect(result).toHaveProperty(
        "codigoBarras",
        "83860000005096000190000008017823000034306271"
      );

      expect(result).toHaveProperty(
        "linhaDigitavel",
        "838600000050096000190009000801782309000343062712"
      );
    });
  });
  describe("Linha Digitável", function () {
    it("deve retornar Objeto com informações do boleto", function () {
      const result = boleto.validarBoleto(
        "838600000050096000190009000801782309000343062712"
      );
      expect(result).toHaveProperty("sucesso", true);
      expect(result).toHaveProperty("mensagem", "Boleto válido");
      expect(result).toHaveProperty("valor", 509.6);
      expect(result).toHaveProperty("tipoCodigoInput", "LINHA_DIGITAVEL");

      expect(result).toHaveProperty(
        "tipoBoleto",
        "CONVENIO_ENERGIA_ELETRICA_E_GAS"
      );

      expect(result).toHaveProperty(
        "codigoBarras",
        "83860000005096000190000008017823000034306271"
      );

      expect(result).toHaveProperty(
        "linhaDigitavel",
        "838600000050096000190009000801782309000343062712"
      );
    });
  });
});

describe("Conversão entre linha digitável e código de barras", function () {
  describe("Converter código de barras para linha digitável", function () {
    describe("Sem formatação", function () {
      it("deve retornar linha digitável numérica válida a partir do código de barras inserido", function () {
        const result = boleto.codBarras2LinhaDigitavel(
          "85820000000572503282035607082021053959190446",
          false
        );
        expect(result).toEqual(
          "858200000007572503282030560708202107539591904460"
        );
      });
    });
    describe("Com formatação", function () {
      it("deve retornar linha digitável com formatação válida a partir do código de barras inserido", function () {
        const result = boleto.codBarras2LinhaDigitavel(
          "85820000000572503282035607082021053959190446",
          true
        );
        expect(result).toEqual(
          "858200000007572503282030560708202107539591904460"
        );
      });
    });
  });
  describe("Converter linha digitável para código de barras", function () {
    it("deve retornar código de barras válido a partir da linha digitável inserida", function () {
      const result = boleto.linhaDigitavel2CodBarras(
        "846300000003299902962024004101360008002006441147"
      );
      expect(result).toEqual("84630000000299902962020041013600000200644114");
    });
  });
});
