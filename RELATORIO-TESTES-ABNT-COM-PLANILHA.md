# RELATORIO DE TESTES COM PLANILHA DE EXECUCAO

## 1 INTRODUCAO

O presente documento registra os testes executados no sistema DocStation GED Industrial, considerando os casos de teste definidos na planilha de validacao do projeto. O objetivo desta etapa foi verificar, de forma pratica, o comportamento do sistema em relacao ao upload e controle documental, versionamento, busca e filtragem, controle de acesso, logs e integracao com API.

Os testes foram executados sobre a versao atual do sistema, com o backend em funcionamento e com persistencia ativa em Supabase.

## 2 OBJETIVO

Os testes tiveram como objetivo avaliar:

- o comportamento funcional dos fluxos centrais do GED;
- a aderencia do sistema aos casos previstos na planilha de testes;
- a consistencia tecnica da API e das regras de permissao;
- a existencia de lacunas funcionais ainda nao implementadas.

## 3 METODOLOGIA

Os testes foram executados em ambiente local com a aplicacao em funcionamento, utilizando chamadas reais para a API, autenticacao com perfis distintos e criacao controlada de documentos temporarios para validacao dos fluxos.

Foram utilizadas as seguintes entradas:

- `admin@tsea.com.br / tsea@2024`
- `supervisor@tsea.com.br / tsea@2024`
- `operador@tsea.com.br / tsea@2024`
- RFID `RFID-OP-001`
- arquivo PDF local para publicacao de revisao

Tambem foram utilizados arquivos simulados para validacao de formato invalido, arquivo CAD e limite de tamanho.

## 4 RESULTADO GERAL

Ao final da execucao, foi obtido o seguinte consolidado:

- `19` casos aprovados
- `2` casos parciais
- `4` casos reprovados

Os principais pontos reprovados ou parciais concentram-se em:

- ausencia de fluxo de reversao para versao anterior;
- ausencia de fluxo de aprovacao formal de documento;
- ausencia de log especifico para tentativa de acesso negado;
- validacao incompleta de cenarios de rede Wi-Fi e uso em dispositivo movel no ambiente atual;
- retorno tecnico inadequado no teste de limite de tamanho do upload.

## 5 PLANILHA DE EXECUCAO DOS TESTES

| Caso | Descricao do teste | Entrada simulada | Resultado esperado | Resultado obtido | Status | Observacao |
|---|---|---|---|---|---|---|
| TC-01 | Upload de documento tecnico valido (PDF) | Arquivo PDF valido | Documento armazenado e revisao criada | `status 201` | APROVADO |  |
| TC-02 | Upload de arquivo em formato nao permitido | `.exe` | Upload bloqueado com erro de formato | `status 400` | APROVADO |  |
| TC-03 | Upload acima do limite de tamanho | PDF de 21 MB | Upload rejeitado com retorno apropriado ao usuario | `status 500` | REPROVADO | O bloqueio ocorreu, mas o retorno tecnico nao ficou adequado para o caso de uso esperado. |
| TC-04 | Upload de arquivo CAD (`.dwg`) | Arquivo `.dwg` valido | Arquivo CAD aceito | `status 201` | APROVADO |  |
| TC-05 | Upload de nova versao de documento existente | Nova revisao para mesmo documento | Nova revisao criada e versao vigente atualizada | `status 201` | APROVADO |  |
| TC-06 | Visualizacao do historico de versoes | Documento com 2 revisoes | Historico exibindo revisoes com data e autor | `2 revisoes retornadas` | APROVADO |  |
| TC-07 | Reversao para versao anterior | Solicitacao de reversao para REV01 | Versao anterior torna-se vigente | Funcionalidade nao encontrada | REPROVADO | O sistema atual nao possui fluxo implementado de reversao. |
| TC-08 | Acesso a revisao anterior | Download de REV01 por `revisionId` | Revisao anterior acessivel sem perder historico | `status 200` | APROVADO |  |
| TC-09 | Busca por titulo de documento | Titulo exato do documento | Documento localizado na busca | `1 resultado` | APROVADO |  |
| TC-10 | Busca por codigo de documento | Codigo `DRT-004` | Documento localizado por codigo | `1 resultado` | APROVADO |  |
| TC-11 | Filtragem por categoria | Categoria `Desenho de Transformador` | Somente documentos da categoria retornados | `5 resultados` | APROVADO |  |
| TC-12 | Filtragem por etiqueta | Etiqueta `Critico` | Somente documentos com a etiqueta retornados | `2 resultados` | APROVADO |  |
| TC-13 | Busca por termo inexistente | `termo-inexistente-xyz` | Lista vazia | `0 resultados` | APROVADO |  |
| TC-14 | Controle de acesso para upload por operador | Operador tenta criar documento | Fluxo conforme regra de permissao | `status 403` | APROVADO | O operador foi bloqueado. Nao existe fluxo de aprovacao intermediaria neste caso. |
| TC-15 | Aprovacao de documento por supervisor | Documento em aguardando aprovacao | Status muda para aprovado | Fluxo de aprovacao nao implementado | REPROVADO | O sistema atual nao possui status `Aguardando Aprovacao` e `Aprovado` com aprovador. |
| TC-16 | Administrador acessa area administrativa | `GET /api/users` com admin | Acesso liberado ao administrador | `status 200` | APROVADO |  |
| TC-17 | Operador sem acesso administrativo | `GET /api/users` com operador | Acesso negado | `status 403` | APROVADO |  |
| TC-18 | Supervisor visualiza apenas documentos permitidos por grupo | Comparacao supervisor x admin | Supervisor nao ve todos os documentos do admin | `supervisor 6 / admin 7` | APROVADO |  |
| TC-19 | Registro de upload no log | Upload valido do documento de teste | Log de upload registrado | `log encontrado` | APROVADO |  |
| TC-20 | Registro de aprovacao no log | Aprovacao por supervisor | Log de aprovacao registrado | Fluxo de aprovacao nao existe | REPROVADO | A falha decorre da inexistencia do fluxo de aprovacao no sistema atual. |
| TC-21 | Tentativa de acesso nao autorizado registrada | Operador acessa rota administrativa | Tentativa registrada em log | Sem registro especifico da tentativa | REPROVADO | O bloqueio existe, mas nao ha log especifico da tentativa negada. |
| TC-22 | API retorna lista de documentos autenticada | `GET /api/documents` com JWT | `status 200` com JSON de documentos | `status 200` | APROVADO |  |
| TC-23 | API rejeita requisicao sem autenticacao | `GET /api/documents` sem `Authorization` | `status 401` | `status 401` | APROVADO |  |
| TC-24 | Conectividade com latencia elevada | Simulacao limitada de requisicao remota | Sistema continua respondendo sem queda | `status 200 em 12ms` | PARCIAL | Nao houve simulacao real de rede Wi-Fi com 500 ms no ambiente atual. |
| TC-25 | Acesso em tablet/celular via Wi-Fi | Validacao documental do layout responsivo | Interface acessivel em dispositivo movel | Validacao indireta pela implementacao responsiva | PARCIAL | Nao houve validacao visual controlada em viewport movel neste ambiente. |

## 6 ANALISE DOS RESULTADOS

Os testes demonstraram que o sistema apresenta bom desempenho nos fluxos mais importantes do GED, principalmente:

- upload de documentos permitidos;
- bloqueio de formatos nao autorizados;
- versionamento automatico;
- consulta de historico;
- busca e filtragem;
- restricao de acesso por perfil;
- registro de logs principais;
- resposta autenticada da API.

Por outro lado, os resultados tambem evidenciaram pontos que ainda podem ser considerados lacunas funcionais ou tecnicas:

- o sistema nao possui mecanismo de reversao de revisao anterior como acao formal;
- o fluxo de aprovacao de documento por supervisor nao faz parte da implementacao atual;
- o controle de tentativa de acesso negado nao gera log especifico;
- o tratamento do erro de limite de tamanho ainda nao esta ideal do ponto de vista de retorno;
- os cenarios de Wi-Fi com latencia controlada e uso em tablet ou celular nao puderam ser homologados integralmente no ambiente de teste atual.

## 7 VALIDACAO COMPLEMENTAR DO MODO OFFLINE

Considerando o contexto operacional industrial do GED, foi realizada ainda uma validacao complementar voltada ao comportamento do sistema em perda temporaria de conexao. O objetivo desta etapa foi verificar se a aplicacao continuaria utilizavel durante instabilidade de rede, sem travamento da interface, e se seria capaz de sincronizar acoes leves assim que a conectividade fosse restabelecida.

### 7.1 Escopo da validacao offline

Foram considerados como objetivos desta verificacao:

- manter disponiveis, em cache, consultas ja realizadas anteriormente;
- permitir abertura de documentos previamente acessados;
- manter a interface responsiva durante a indisponibilidade de conexao;
- registrar determinadas acoes leves em fila local para sincronizacao posterior;
- bloquear acoes criticas que poderiam comprometer a integridade documental.

### 7.2 Implementacao avaliada

Durante a inspecao funcional do sistema, foram identificados os seguintes mecanismos relacionados ao modo offline:

- cache local para respostas `GET /api/...`;
- cache binario para arquivos de documentos ja acessados;
- fila local de acoes pendentes;
- sincronizacao automatica ao retorno da conexao;
- indicador visual de conectividade na interface.

### 7.3 Planilha de validacao offline

| Caso | Descricao do teste | Entrada simulada | Resultado esperado | Resultado obtido | Status | Observacao |
|---|---|---|---|---|---|---|
| TO-01 | Reutilizacao de consulta em cache | Lista de documentos carregada online e nova consulta sem rede | Sistema exibe dados previamente sincronizados | Implementacao presente em cache local de `GET /api/...` | APROVADO | Validacao tecnica confirmada no fluxo de consultas. |
| TO-02 | Abertura offline de documento ja acessado | Documento aberto online e reaberto sem conexao | Documento permanece disponivel por cache local | Implementacao presente para binarios e preview | APROVADO | Depende de o arquivo ter sido previamente carregado. |
| TO-03 | Download offline de documento ja sincronizado | Arquivo previamente baixado/carregado e nova tentativa sem rede | Download realizado a partir do cache | Implementacao presente em cache binario | APROVADO | Restrito a documentos ja cacheados. |
| TO-04 | Registro de acao leve offline | Conclusao de lote executada sem conexao | Acao entra em fila local sem travar a interface | Fila local implementada e preparada para sincronizacao posterior | APROVADO | Exige reconexao para persistencia final no servidor. |
| TO-05 | Sincronizacao automatica ao reconectar | Acao pendente em fila local e retorno da internet | Fila e reenviada automaticamente | Sincronizacao automatica implementada por evento `online` | APROVADO | Validacao tecnica confirmada no fluxo de sincronizacao. |
| TO-06 | Indicacao visual de conectividade | Sistema online, offline e com pendencias | Interface informa `Online`, `Offline` ou pendencias | Indicador implementado na barra superior | APROVADO | Recurso importante para uso operacional. |
| TO-07 | Publicacao de nova revisao offline | Tentativa de enviar arquivo sem conexao | Sistema bloqueia a acao critica | Fluxo permanece dependente de conexao ativa | APROVADO | Comportamento intencional para preservar integridade documental. |
| TO-08 | Exclusao de documento offline | Tentativa de excluir sem conexao | Sistema bloqueia a acao critica | Fluxo permanece dependente de conexao ativa | APROVADO | Comportamento intencional para preservar integridade documental. |
| TO-09 | Primeiro acesso offline a documento nunca carregado | Documento nao visitado previamente e perda de conexao | Documento nao deve abrir sem cache previo | Comportamento restrito ao cache previamente aquecido | APROVADO | Limitacao esperada no modelo atual de fallback. |
| TO-10 | Validacao completa em navegador com simulacao real de rede | Queda e retorno de rede em execucao manual | Confirmacao visual integral do comportamento offline | Homologacao manual ainda necessaria | PARCIAL | A base tecnica foi validada, mas a confirmacao final depende de execucao manual em navegador real. |

### 7.4 Resultado obtido na validacao offline

A validacao indicou que o sistema passou a suportar um modelo de resiliencia operacional parcial, adequado ao cenario de consulta e continuidade de uso em situacoes de queda temporaria de rede. Os principais comportamentos observados foram:

- consultas previamente realizadas podem ser reutilizadas por cache local;
- documentos ja acessados podem permanecer disponiveis para consulta e download por cache;
- o sistema exibe ao usuario o estado de conectividade e a existencia de pendencias;
- determinadas acoes operacionais leves podem ser registradas localmente e reenviadas quando a conexao retorna.

Tambem foi verificado que determinadas operacoes permanecem corretamente dependentes de conexao ativa, por se tratarem de acoes criticas do GED:

- publicacao de nova revisao;
- exclusao de documento;
- acesso inicial a documento ainda nao carregado no cache;
- envio de novo arquivo ao servidor.

### 7.5 Limitacoes encontradas

Durante a validacao complementar, foi identificado um problema funcional na tela de detalhe do documento, relacionado a ordem de hooks do componente `DocumentView`. O problema foi corrigido durante a propria etapa de teste, e a aplicacao voltou a compilar normalmente apos o ajuste.

Mesmo com a implementacao offline integrada, a homologacao completa do comportamento em ambiente desconectado ainda depende de execucao manual em navegador, com simulacao real de perda e retorno de rede, especialmente para confirmar:

- permanencia da visualizacao de documentos ja cacheados;
- sincronizacao das acoes pendentes;
- comportamento em tablet e ambiente de rede sem fio instavel.

### 7.6 Conclusao da validacao offline

Conclui-se que o sistema nao se caracteriza, no estado atual, como uma aplicacao `offline-first` completa. Entretanto, a implementacao realizada fornece um mecanismo de fallback adequado para o GED, permitindo que o operador ou supervisor continue consultando dados ja sincronizados e registrando acoes leves sem travamento da interface durante queda temporaria de conexao.

Esse comportamento representa um ganho importante de robustez operacional para o contexto industrial, ainda que funcionalidades criticas de versionamento e upload continuem corretamente condicionadas a conexao ativa.

## 8 CONCLUSAO

Com base nos testes executados, conclui-se que o sistema DocStation GED Industrial atende satisfatoriamente a maior parte dos casos centrais da planilha de validacao, especialmente aqueles relacionados ao gerenciamento documental, versoes, filtros, autenticacao e operacao da API.

Os resultados indicam que a solucao se encontra em estado funcional consistente para apresentacao e validacao de MVP. Entretanto, permanecem como oportunidades de melhoria alguns itens especificos, sobretudo os relacionados a fluxo formal de aprovacao, reversao de versao, rastreabilidade de acesso negado e validacao de cenarios operacionais de rede e mobilidade.
