import { tool as base64FileConverter } from './base64-file-converter';
import { tool as base64StringConverter } from './base64-string-converter';
import { tool as basicAuthGenerator } from './basic-auth-generator';

import { tool as asciiTextDrawer } from './ascii-text-drawer';

import { tool as textToUnicode } from './text-to-unicode';
import { tool as safelinkDecoder } from './safelink-decoder';
import { tool as pdfSignatureChecker } from './pdf-signature-checker';
import { tool as numeronymGenerator } from './numeronym-generator';
import { tool as macAddressGenerator } from './mac-address-generator';
import { tool as textToBinary } from './text-to-binary';
import { tool as ulidGenerator } from './ulid-generator';
import { tool as ibanValidatorAndParser } from './iban-validator-and-parser';
import { tool as stringObfuscator } from './string-obfuscator';
import { tool as textDiff } from './text-diff';
import { tool as emojiPicker } from './emoji-picker';
import { tool as passwordStrengthAnalyser } from './password-strength-analyser';
import { tool as yamlToToml } from './yaml-to-toml';
import { tool as jsonToToml } from './json-to-toml';
import { tool as tomlToYaml } from './toml-to-yaml';
import { tool as tomlToJson } from './toml-to-json';
import { tool as jsonToCsv } from './json-to-csv';
import { tool as cameraRecorder } from './camera-recorder';
import { tool as listConverter } from './list-converter';
import { tool as phoneParserAndFormatter } from './phone-parser-and-formatter';
import { tool as jsonDiff } from './json-diff';
import { tool as ipv4RangeExpander } from './ipv4-range-expander';
import { tool as httpStatusCodes } from './http-status-codes';
import { tool as yamlToJson } from './yaml-to-json-converter';
import { tool as jsonToYaml } from './json-to-yaml-converter';
import { tool as ipv6UlaGenerator } from './ipv6-ula-generator';
import { tool as ipv4AddressConverter } from './ipv4-address-converter';
import { tool as benchmarkBuilder } from './benchmark-builder';
import { tool as userAgentParser } from './user-agent-parser';
import { tool as ipv4SubnetCalculator } from './ipv4-subnet-calculator';
import { tool as dockerRunToDockerComposeConverter } from './docker-run-to-docker-compose-converter';
import { tool as htmlWysiwygEditor } from './html-wysiwyg-editor';
import { tool as rsaKeyPairGenerator } from './rsa-key-pair-generator';
import { tool as textToNatoAlphabet } from './text-to-nato-alphabet';
import { tool as slugifyString } from './slugify-string';
import { tool as keycodeInfo } from './keycode-info';
import { tool as jsonMinify } from './json-minify';
import { tool as bcrypt } from './bcrypt';
import { tool as bip39 } from './bip39-generator';
import { tool as caseConverter } from './case-converter';
import { tool as chmodCalculator } from './chmod-calculator';
import { tool as chronometer } from './chronometer';
import { tool as colorConverter } from './color-converter';
import { tool as crontabGenerator } from './crontab-generator';
import { tool as dateTimeConverter } from './date-time-converter';
import { tool as deviceInformation } from './device-information';
import { tool as cypher } from './encryption';
import { tool as etaCalculator } from './eta-calculator';
import { tool as percentageCalculator } from './percentage-calculator';
import { tool as gitMemo } from './git-memo';
import { tool as hashText } from './hash-text';
import { tool as hmacGenerator } from './hmac-generator';
import { tool as htmlEntities } from './html-entities';
import { tool as baseConverter } from './integer-base-converter';
import { tool as jsonViewer } from './json-viewer';
import { tool as jwtParser } from './jwt-parser';
import { tool as loremIpsumGenerator } from './lorem-ipsum-generator';
import { tool as mathEvaluator } from './math-evaluator';
import { tool as metaTagGenerator } from './meta-tag-generator';
import { tool as mimeTypes } from './mime-types';
import { tool as otpCodeGeneratorAndValidator } from './otp-code-generator-and-validator';
import { tool as qrCodeGenerator } from './qr-code-generator';
import { tool as wifiQrCodeGenerator } from './wifi-qr-code-generator';
import { tool as randomPortGenerator } from './random-port-generator';
import { tool as romanNumeralConverter } from './roman-numeral-converter';
import { tool as sqlPrettify } from './sql-prettify';
import { tool as svgPlaceholderGenerator } from './svg-placeholder-generator';
import { tool as temperatureConverter } from './temperature-converter';
import { tool as textStatistics } from './text-statistics';
import { tool as tokenGenerator } from './token-generator';
import type { ToolCategory } from './tools.types';
import { tool as urlEncoder } from './url-encoder';
import { tool as urlParser } from './url-parser';
import { tool as uuidGenerator } from './uuid-generator';
import { tool as macAddressLookup } from './mac-address-lookup';
import { tool as xmlFormatter } from './xml-formatter';
import { tool as yamlViewer } from './yaml-viewer';

// Added ERC Tools
import { tool as erc20 } from './erc-20';
import { tool as erc165 } from './erc-165';
import { tool as erc173 } from './erc-173';
import { tool as erc191 } from './erc-191';
import { tool as erc721 } from './erc-721';
import { tool as erc777 } from './erc-777';
import { tool as erc725 } from './erc-725';
import { tool as erc1155 } from './erc-1155';
import { tool as erc1167 } from './erc-1167';
import { tool as erc1271 } from './erc-1271';
import { tool as erc1967 } from './erc-1967';

// Added EVM Tools
import { tool as evmKeys } from './evm-keys';
import { tool as evmAddress } from './evm-address';
import { tool as evmChecksum } from './evm-checksum';
import { tool as evmCreate } from './evm-create';
import { tool as evmCreate2 } from './evm-create2';
import { tool as evmNetwork } from './evm-network';
import { tool as evmUnits } from './evm-units';
import { tool as evmKeccak256 } from './evm-keccak256';
import { tool as evmSignature } from './evm-signature';
import { tool as evmNamehash } from './evm-namehash';
import { tool as evmRawTxDecode } from './evm-raw-tx-decode';

// LSP
import { tool as lsp7 } from './lsp-7';
import { tool as lsp8 } from './lsp-8';

export const toolsByCategory: ToolCategory[] = [
  {
    name: 'ERC',
    components: [erc20, erc165, erc173, erc191, erc721, erc725, erc777, erc1155, erc1167, erc1271, erc1967],
  },
  {
    name: 'EVM',
    components: [
      evmKeys,
      evmAddress,
      evmChecksum,
      evmCreate,
      evmCreate2,
      evmNetwork,
      evmUnits,
      evmKeccak256,
      evmSignature,
      evmNamehash,
      evmRawTxDecode,
    ],
  },
  {
    name: 'LSP',
    components: [lsp7, lsp8],
  },
  {
    name: 'Crypto',
    components: [
      tokenGenerator,
      hashText,
      bcrypt,
      uuidGenerator,
      ulidGenerator,
      cypher,
      bip39,
      hmacGenerator,
      rsaKeyPairGenerator,
      passwordStrengthAnalyser,
      pdfSignatureChecker,
    ],
  },
  {
    name: 'Converter',
    components: [
      dateTimeConverter,
      baseConverter,
      romanNumeralConverter,
      base64StringConverter,
      base64FileConverter,
      colorConverter,
      caseConverter,
      textToNatoAlphabet,
      textToBinary,
      textToUnicode,
      yamlToJson,
      yamlToToml,
      jsonToYaml,
      jsonToToml,
      listConverter,
      tomlToJson,
      tomlToYaml,
    ],
  },
  {
    name: 'Web',
    components: [
      urlEncoder,
      htmlEntities,
      urlParser,
      deviceInformation,
      basicAuthGenerator,
      metaTagGenerator,
      otpCodeGeneratorAndValidator,
      mimeTypes,
      jwtParser,
      keycodeInfo,
      slugifyString,
      htmlWysiwygEditor,
      userAgentParser,
      httpStatusCodes,
      jsonDiff,
      safelinkDecoder,
    ],
  },
  {
    name: 'Images and videos',
    components: [qrCodeGenerator, wifiQrCodeGenerator, svgPlaceholderGenerator, cameraRecorder],
  },
  {
    name: 'Development',
    components: [
      gitMemo,
      randomPortGenerator,
      crontabGenerator,
      jsonViewer,
      jsonMinify,
      jsonToCsv,
      sqlPrettify,
      chmodCalculator,
      dockerRunToDockerComposeConverter,
      xmlFormatter,
      yamlViewer,
    ],
  },
  {
    name: 'Network',
    components: [
      ipv4SubnetCalculator,
      ipv4AddressConverter,
      ipv4RangeExpander,
      macAddressLookup,
      macAddressGenerator,
      ipv6UlaGenerator,
    ],
  },
  {
    name: 'Math',
    components: [mathEvaluator, etaCalculator, percentageCalculator],
  },
  {
    name: 'Measurement',
    components: [chronometer, temperatureConverter, benchmarkBuilder],
  },
  {
    name: 'Text',
    components: [
      loremIpsumGenerator,
      textStatistics,
      emojiPicker,
      stringObfuscator,
      textDiff,
      numeronymGenerator,
      asciiTextDrawer,
    ],
  },
  {
    name: 'Data',
    components: [phoneParserAndFormatter, ibanValidatorAndParser],
  },
];

export const tools = toolsByCategory.flatMap(({ components }) => components);
export const toolsWithCategory = toolsByCategory.flatMap(({ components, name }) =>
  components.map((tool) => ({ category: name, ...tool })),
);
