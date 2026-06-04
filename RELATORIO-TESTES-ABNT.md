# RELATORIO DE TESTES DO SISTEMA GED INDUSTRIAL

## 1 INTRODUCAO

Este documento apresenta o relatorio de testes realizados no sistema DocStation GED Industrial, desenvolvido para a TSEA, com o objetivo de verificar o comportamento funcional, tecnico e operacional da solucao proposta. A finalidade desta etapa foi validar se o sistema implementado atende aos principais requisitos definidos ao longo do projeto, especialmente aqueles relacionados a autenticacao, controle documental, versionamento, rastreabilidade, persistencia e integracao com o aplicativo associado.

Os testes aqui descritos foram executados sobre a versao funcional do sistema, considerando tanto verificacoes estaticas quanto testes reais de operacao da aplicacao.

## 2 OBJETIVO DOS TESTES

Os testes tiveram como objetivo principal verificar:

- o funcionamento da autenticacao por login e por RFID;
- o controle de acesso por perfil de usuario;
- a consistencia do gerenciamento documental;
- a publicacao e manutencao de revisoes;
- a geracao e persistencia de logs;
- a integracao minima com o aplicativo industrial;
- a persistencia das informacoes apos reinicializacao do servidor.

## 3 METODOLOGIA

Os testes foram realizados em ambiente local de desenvolvimento com persistencia em Supabase, utilizando a API do sistema em execucao real. A validacao foi dividida em tres etapas complementares.

### 3.1 Verificacao estatica

Inicialmente, foram executadas as verificacoes de tipagem e consistencia do projeto com os seguintes comandos:

- `npm run check`
- `npm run check:server`

Essa etapa teve como finalidade identificar erros de compilacao, conflitos de tipagem e inconsistencias estruturais no codigo-fonte.

### 3.2 Testes funcionais da API

Na segunda etapa, foram realizados testes reais nos endpoints do sistema, contemplando:

- autenticacao;
- leitura de dados do usuario autenticado;
- listagem de documentos;
- detalhamento de documento;
- criacao de documento;
- upload de revisao;
- visualizacao e download;
- exclusao de documento;
- leitura de logs;
- listagem de usuarios, grupos, categorias e etiquetas;
- endpoints relacionados a integracao com o aplicativo.

### 3.3 Testes de persistencia

Por fim, foram executados testes de persistencia, reiniciando o servidor apos operacoes relevantes para verificar se os dados permaneciam registrados corretamente no banco de dados e no armazenamento utilizado pelo sistema.

## 4 DADOS E ENTRADAS UTILIZADAS

Para a execucao dos testes, foram utilizadas credenciais e entradas previamente cadastradas no sistema.

### 4.1 Credenciais

- `admin@tsea.com.br / tsea@2024`
- `supervisor@tsea.com.br / tsea@2024`
- `operador@tsea.com.br / tsea@2024`

### 4.2 Identificacao por RFID

- `RFID-OP-001`

### 4.3 Arquivo de teste

Foi utilizado um arquivo PDF local para validacao do fluxo de publicacao de revisao de documentos.

## 5 TESTES REALIZADOS

### 5.1 Testes de autenticacao

Foram realizados testes de login com os tres perfis principais do sistema: administrador, supervisor e operador. Em todos os casos, o sistema autenticou corretamente os usuarios e retornou suas informacoes de sessao, incluindo o perfil e o conjunto de permissoes esperado.

Tambem foi validado o fluxo de autenticacao por RFID, confirmando que o backend reconhece a tag cadastrada e associa corretamente o usuario correspondente.

Adicionalmente, foi testado o processo de logout. Apos os ajustes realizados no backend, o token passou a ser efetivamente revogado, impedindo seu reuso tanto imediatamente apos o logout quanto apos a reinicializacao do servidor.

### 5.2 Testes de controle de acesso

Foram executados testes para verificar a restricao de rotas conforme o perfil do usuario.

Os resultados mostraram que:

- o administrador possui acesso completo as rotas de gestao;
- o supervisor possui acesso intermediario, compativel com operacoes documentais e leitura operacional;
- o operador nao acessa rotas administrativas, recebendo bloqueio apropriado quando tenta consultar recursos como usuarios, categorias e logs administrativos.

Tambem foi validado o filtro de documentos por grupo operacional, confirmando que usuarios nao administradores visualizam apenas os documentos associados aos grupos permitidos.

### 5.3 Testes de gerenciamento documental

No modulo de documentos, foram executados testes de:

- listagem de documentos;
- leitura de detalhes;
- criacao de novo documento;
- validacao da geracao automatica de codigo documental;
- publicacao de revisao;
- exclusao de documento.

Durante a validacao, foi confirmado que o sistema gera automaticamente o codigo do documento com base na categoria correspondente, respeitando a logica de prefixo e sequencia numerica. Da mesma forma, as revisoes foram geradas automaticamente em ordem crescente, sem necessidade de preenchimento manual pelo usuario.

### 5.4 Testes de revisao, visualizacao e download

Foi criado um documento temporario de teste e, em seguida, foi publicada uma revisao real com upload de arquivo. O sistema registrou corretamente a nova revisao e atualizou a revisao vigente do documento.

Posteriormente, foram realizados testes de preview e download. Documentos novos passaram a responder corretamente com retorno de arquivo PDF. Durante a auditoria, tambem foi identificado um problema em documentos legados que geravam erro `502`. Esse comportamento foi corrigido, e o fluxo foi atualizado para lidar melhor com arquivos antigos, inclusive com fallback controlado quando o arquivo original nao esta disponivel.

### 5.5 Testes de logs

Foram validados logs referentes a:

- login;
- logout;
- visualizacao;
- upload;
- publicacao de revisao;
- download;
- exclusao.

Os registros foram persistidos corretamente, mantendo o historico mesmo apos a reinicializacao do servidor. Tambem foi confirmado que a visualizacao desses logs respeita o perfil do usuario, em consonancia com as regras de seguranca aplicadas ao sistema.

### 5.6 Testes da integracao com o aplicativo

Foram testados os endpoints relacionados ao aplicativo, incluindo:

- validacao de cracha por NFC;
- consulta de documentos disponiveis para o usuario do app;
- sincronizacao de acessos;
- registro de logs do app.

O sistema respondeu adequadamente aos fluxos minimos previstos. Durante os testes, a importacao de base externa do app tambem foi analisada. Inicialmente, a funcionalidade retornava erro quando a origem nao estava configurada. Apos ajuste, o sistema passou a responder de forma controlada, informando que a origem externa ainda nao esta configurada no ambiente atual, sem comprometer a estabilidade do GED.

### 5.7 Testes de persistencia

Foram realizados testes de reinicializacao do servidor apos:

- criacao de documento;
- geracao de logs;
- logout com revogacao de token.

Os resultados demonstraram que os dados permaneceram persistidos no banco, incluindo documentos, logs e revogacoes de token, confirmando a operacao correta do sistema com Supabase Postgres e Storage.

## 6 RESULTADOS OBTIDOS

Com base nos testes executados, observou-se que o sistema apresentou comportamento satisfatorio nos fluxos principais do GED. Os seguintes pontos foram confirmados:

- autenticacao funcional por login e RFID;
- segregacao de acesso por perfil;
- controle documental com codigo automatico;
- versionamento automatico de revisoes;
- upload, preview e download em funcionamento;
- exclusao de documentos com registro em log;
- persistencia de dados apos reinicio;
- integracao minima com o aplicativo em funcionamento;
- rastreabilidade das acoes principais.

Tambem foram identificados e corrigidos problemas relevantes durante o processo de validacao, o que fortaleceu a confiabilidade tecnica da versao auditada.

## 7 CONCLUSAO

Os testes realizados demonstram que o sistema DocStation GED Industrial possui funcionamento consistente em seus requisitos centrais, apresentando viabilidade tecnica e operacional para o escopo proposto no projeto.

Os resultados obtidos indicam que a solucao atende aos principais objetivos do sistema, especialmente no que se refere ao controle documental, rastreabilidade, segregacao de acesso e preparacao para integracao com o aplicativo industrial.

Desse modo, conclui-se que o sistema se encontra em condicao adequada para demonstracao, validacao de MVP e continuidade de evolucao, mantendo base tecnica suficiente para aperfeicoamentos futuros.
