# Bibliotecas de terceiros (vendor/)

Os arquivos são servidos localmente (sem CDN) e são cópias exatas dos arquivos minificados
publicados no npm. Não edite à mão: para atualizar, instale a nova versão numa pasta temporária e copie
os mesmos arquivos (veja "Como atualizar").

| Arquivo | Pacote npm | Versão | Licença |
|---|---|---|---|
| `gsap.min.js` | `gsap` | 3.15.0 | GSAP Standard "no charge" License |
| `ScrollTrigger.min.js` | `gsap` (plugin) | 3.15.0 | GSAP Standard "no charge" License |
| `SplitText.min.js` | `gsap` (plugin) | 3.15.0 | GSAP Standard "no charge" License |
| `lenis.min.js` | `lenis` | 1.3.27 | MIT |

## GSAP (GreenSock / Webflow)

- Licença: <https://gsap.com/standard-license>. Foi conferida em 29/10/2026. O campo `license` do
  `package.json` aponta para esse endereço.
- O README do pacote diz: *"GSAP is now 100% FREE including ALL of the bonus plugins like SplitText […]
  even for commercial use!"*. Segundo o FAQ da licença, "Commercial usage is covered under the standard
  license", e isso inclui todos os plugins (SplitText, ScrollTrigger).
- Restrições que importam para este site:
  - **Uso proibido:** usar a GSAP em ferramentas no-code de animação visual que concorram com o
    Webflow. Um site de barbearia **não** se enquadra nisso.
  - **Avisos de copyright:** não remova os comentários de licença no topo dos arquivos.

## Lenis (darkroom.engineering)

- Licença MIT, Copyright (c) 2024 darkroom.engineering. Repositório:
  <https://github.com/darkroomengineering/lenis>.
- **Alterações na cópia local:**
  - a linha `//# sourceMappingURL=lenis.min.js.map` foi removida, porque o `.map` não é publicado e
    causaria um 404;
  - um comentário com o aviso de copyright do MIT foi adicionado no topo.

## Como atualizar

```bash
mkdir /tmp/libs && cd /tmp/libs && npm init -y && npm i gsap@latest lenis@latest
cp node_modules/gsap/dist/{gsap,ScrollTrigger,SplitText}.min.js <projeto>/vendor/
sed '/sourceMappingURL/d' node_modules/lenis/dist/lenis.min.js > <projeto>/vendor/lenis.min.js
# recoloque o aviso MIT no topo de lenis.min.js e atualize a tabela acima
```

Depois de atualizar, teste a página com os quatro arquivos e também sem eles: o site precisa
funcionar igual nos dois casos.
