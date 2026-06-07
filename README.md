◆ ----------------------------------------------------------- ◆

# Speedesk

### Sistema de Custódia e Marketplace de Ativos Digitais

Speedesk é uma plataforma bilateral de alta fidelidade voltada para a comercialização e custódia de ativos digitais técnicos, como slides, modelos 3D, templates de sites e códigos fonte. O sistema atua como um intermediário de confiança, garantindo a integridade dos arquivos e a segurança financeira de ambas as partes através de processos automatizados de auditoria e retenção.

[Acesse a Demonstração](https://speedesk-test.vercel.app)

---

### Estado Atual: MVP Operacional

O Produto Mínimo Viável contempla os fluxos fundamentais de um sistema de informação distribuído e seguro:

+ **Autenticação de Segurança:** Gestão de identidades e níveis de acesso (RBAC) via Supabase Auth com perfis persistidos em PostgreSQL.
+ **Integração Financeira:** Checkout dinâmico integrado à API do Stripe para processamento de pagamentos e gestão de assinaturas em tempo real.
+ **Lógica de Escrow (Custódia):** Regra de negócio com quarentena de 7 dias para saldos de vendas e janela de disputa técnica de 48 horas para compradores.
+ **Logística de Ativos:** Armazenamento em Cloud Storage com entrega via Signed URLs, garantindo que o link de download seja temporário e de uso exclusivo.

---

### Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| Interface | React 18 + Vite |
| Estilização | Tailwind CSS (Aetheric Flux) |
| Motor Backend | Node.js + Express |
| Banco de Dados | PostgreSQL (Supabase) |

---

### Planejamento de Atualizações (Roadmap)

Como evolução do MVP, as seguintes implementações estão previstas para as próximas versões do sistema:

+ **Triagem ClamAV:** Integração de motor antivírus a nível de servidor para varredura automática de binários em cada upload realizado por criadores.
+ **Suporte em Tempo Real:** Implementação de canal de mediação via WebSockets para resolução instantânea de disputas e suporte técnico.
+ **Hardening de Segurança:** Adição de Autenticação Multifator (MFA) e criptografia de metadados sensíveis de transação.
+ **Versionamento Técnico:** Sistema de controle de versões para permitir que criadores subam atualizações de seus produtos para compradores antigos.

---

### Equipe de Desenvolvimento

+ **João Vitor Alencar**
+ **Matheus Ramos**

---

◆ ------------------- SPEEDESK SYSTEMS 2026 ------------------- ◆
