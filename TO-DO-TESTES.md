# TO DO — Testes da radiosimplificada

Checklist para testar a rádio como usuário, principalmente pelo celular.

## 1. Acesso inicial

- [ ] Abrir a frontend em uma aba normal do navegador.
- [ ] Abrir a frontend em uma aba anônima/privativa.
- [ ] Abrir pelo celular usando Wi-Fi.
- [ ] Abrir pelo celular usando dados móveis.
- [ ] Confirmar que a página carrega sem mensagens de erro.
- [ ] Confirmar que o nome da rádio aparece corretamente no topo.
- [ ] Confirmar que a descrição aparece abaixo do nome.
- [ ] Confirmar que o banner aparece corretamente.
- [ ] Confirmar que o favicon aparece na aba do navegador.
- [ ] Fechar e reabrir a aba para verificar se o favicon continua correto.

## 2. Player e áudio

- [ ] Pressionar Play uma única vez.
- [ ] Confirmar que o botão muda para Pause.
- [ ] Confirmar que o título da primeira faixa aparece.
- [ ] Confirmar que a faixa realmente começa a tocar.
- [ ] Confirmar que as três barras do VU meter reagem ao áudio.
- [ ] Verificar se a primeira barra reage aos graves.
- [ ] Verificar se a segunda barra reage às frequências médias.
- [ ] Verificar se a terceira barra reage às frequências mais altas.
- [ ] Pressionar Pause.
- [ ] Confirmar que o áudio para imediatamente.
- [ ] Confirmar que o botão volta ao símbolo Play.
- [ ] Pressionar Play novamente.
- [ ] Confirmar que o player retoma sem abrir duas faixas simultâneas.
- [ ] Aguardar o final da primeira faixa.
- [ ] Confirmar que a segunda faixa começa automaticamente.
- [ ] Confirmar que o título muda para a segunda faixa.
- [ ] Aguardar o final da segunda faixa.
- [ ] Confirmar que o player retorna à primeira faixa.
- [ ] Recarregar a página enquanto o player está parado.
- [ ] Recarregar a página enquanto o player está tocando.
- [ ] Confirmar que o navegador não inicia áudio automaticamente após a recarga.
- [ ] Testar o botão Play com toques rápidos repetidos.
- [ ] Confirmar que apenas uma faixa toca por vez.

## 3. Programação e sequência

- [ ] Abrir o painel administrativo.
- [ ] Entrar em **Programação**.
- [ ] Confirmar que todas as faixas enviadas ao GitHub estão cadastradas.
- [ ] Conferir se cada ID é única.
- [ ] Conferir se cada título corresponde ao arquivo correto.
- [ ] Conferir se cada caminho começa com `audio/`.
- [ ] Conferir se o nome do arquivo corresponde exatamente ao arquivo no GitHub.
- [ ] Colocar duas IDs na Sequência 1.
- [ ] Salvar a programação.
- [ ] Abrir a frontend em uma nova aba.
- [ ] Confirmar a ordem das faixas no player.
- [ ] Alterar a ordem das IDs.
- [ ] Salvar novamente.
- [ ] Recarregar a frontend.
- [ ] Confirmar que a nova ordem foi aplicada.
- [ ] Criar uma Sequência 2 com pelo menos duas faixas.
- [ ] Selecionar a Sequência 2 como ativa.
- [ ] Salvar.
- [ ] Reabrir a frontend.
- [ ] Confirmar que o player usa a sequência ativa correta.
- [ ] Voltar para a Sequência 1 e confirmar que ela continua preservada.
- [ ] Testar uma faixa repetida na sequência, por exemplo: `1, 2, 1`.
- [ ] Confirmar que a repetição ocorre conforme a sequência salva.

## 4. Upload de áudio pelo GitHub

Para cada nova faixa:

- [ ] Enviar o arquivo para a pasta `audio/` do repositório.
- [ ] Confirmar que o commit foi concluído na branch `main`.
- [ ] Copiar exatamente o nome do arquivo.
- [ ] Cadastrar a faixa no painel.
- [ ] Usar o caminho `audio/nome-do-arquivo.mp3`.
- [ ] Incluir a ID na sequência ativa.
- [ ] Salvar a programação.
- [ ] Testar o áudio na frontend.

Testar também arquivos com:

- [ ] Letras maiúsculas e minúsculas;
- [ ] Espaços no nome;
- [ ] Acentos;
- [ ] Hífen ou sublinhado;
- [ ] Nome de arquivo mais longo.

## 5. Configurações visuais

- [ ] Alterar o nome da rádio.
- [ ] Salvar.
- [ ] Confirmar o nome no frontend.
- [ ] Confirmar o nome no rodapé.
- [ ] Confirmar o nome no painel administrativo.
- [ ] Alterar a descrição.
- [ ] Salvar.
- [ ] Confirmar a descrição no frontend.
- [ ] Alterar a cor de destaque.
- [ ] Salvar.
- [ ] Confirmar a cor no player e nos elementos de interação.
- [ ] Enviar uma nova imagem para a pasta `images/`.
- [ ] Informar o caminho, por exemplo `images/banner.jpg`.
- [ ] Salvar.
- [ ] Recarregar a frontend.
- [ ] Confirmar que o banner mudou.
- [ ] Enviar uma imagem PNG para a pasta `images/`.
- [ ] Informar o caminho do favicon, por exemplo `images/favicon.png`.
- [ ] Salvar.
- [ ] Fechar e reabrir a aba.
- [ ] Confirmar que o favicon mudou.

## 6. Áreas editoriais

### Mensagem

- [ ] Abrir a aba Mensagem no painel.
- [ ] Inserir um texto curto.
- [ ] Salvar.
- [ ] Abrir Mensagem na frontend.
- [ ] Confirmar o texto.
- [ ] Testar um texto com acentos e parágrafos.
- [ ] Confirmar que o alinhamento e o espaçamento permanecem corretos.

### Notícias

- [ ] Inserir um aviso curto.
- [ ] Salvar.
- [ ] Confirmar o aviso na frontend.
- [ ] Testar várias linhas.
- [ ] Confirmar que não aparece uma linha horizontal indevida ao final da caixa.

### Patrocínios

- [ ] Cadastrar um patrocinador.
- [ ] Inserir nome, descrição e imagem.
- [ ] Salvar.
- [ ] Confirmar se o conteúdo aparece na área Patrocínios.
- [ ] Testar com imagem local na pasta `images/`.
- [ ] Testar com uma URL pública de imagem, se necessário.

## 7. Formulário de contato

- [ ] Abrir a área CONTATO.
- [ ] Confirmar que o formulário ocupa a largura correta da caixa.
- [ ] Confirmar o mesmo espaçamento lateral das demais áreas.
- [ ] Confirmar a ordem Nome / Cidade / Estado.
- [ ] Confirmar que Estado é um seletor.
- [ ] Tentar enviar com os campos vazios.
- [ ] Confirmar que o navegador exige o preenchimento.
- [ ] Preencher um nome.
- [ ] Preencher cidade.
- [ ] Selecionar estado.
- [ ] Escrever uma mensagem.
- [ ] Enviar.
- [ ] Confirmar a mensagem de sucesso.
- [ ] Confirmar que o formulário é limpo após o envio.
- [ ] Verificar no JSON remoto se a mensagem foi registrada em `contactMessages`.
- [ ] Repetir o teste pelo celular.
- [ ] Repetir o teste usando dados móveis.

## 8. Estúdio

- [ ] Abrir Administração → Estúdio.
- [ ] Permitir acesso ao microfone.
- [ ] Informar um título.
- [ ] Pressionar Gravar.
- [ ] Confirmar que o botão muda para Parar.
- [ ] Gravar uma mensagem curta.
- [ ] Pressionar Parar.
- [ ] Fazer a pré-escuta.
- [ ] Baixar o arquivo.
- [ ] Confirmar que o arquivo foi salvo no dispositivo.
- [ ] Enviar o arquivo baixado para `audio/` no GitHub.
- [ ] Cadastrar a faixa em Programação.
- [ ] Testar a reprodução na frontend.
- [ ] Repetir o teste pelo celular.
- [ ] Cancelar uma gravação e confirmar que a rádio continua funcionando.

## 9. Manutenção e recuperação

- [ ] Ativar o modo Em manutenção nas Configurações.
- [ ] Salvar.
- [ ] Abrir a frontend.
- [ ] Confirmar a página/estado de manutenção.
- [ ] Desativar o modo Em manutenção.
- [ ] Salvar.
- [ ] Recarregar a frontend.
- [ ] Confirmar que a página normal voltou sem elementos da manutenção.
- [ ] Abrir Backup.
- [ ] Baixar o JSON atual.
- [ ] Abrir o arquivo baixado.
- [ ] Confirmar que ele contém rádio, faixas, sequências e conteúdo.

## 10. Teste final em celular

- [ ] Testar em orientação vertical.
- [ ] Testar em orientação horizontal.
- [ ] Testar em Wi-Fi.
- [ ] Testar em dados móveis.
- [ ] Abrir em uma aba normal.
- [ ] Abrir em uma aba anônima/privativa.
- [ ] Testar o botão Play.
- [ ] Testar avanço automático.
- [ ] Testar o VU meter.
- [ ] Abrir todas as áreas do menu.
- [ ] Testar o formulário de contato.
- [ ] Abrir o painel administrativo.
- [ ] Testar a gravação.
- [ ] Anotar qualquer diferença entre computador e celular.

## Registro de problemas

Para cada problema encontrado, anotar:

- Data e horário;
- Dispositivo;
- Navegador;
- Wi-Fi ou dados móveis;
- Página aberta;
- Ação executada;
- Resultado esperado;
- Resultado observado;
- Nome da faixa ou ID envolvida;
- Captura de tela, se possível.
