# OPS Server Access Runbook (v0.1) — SSH/배포 규격 봉인

목적: 서버 반영 시 “키가 뭐였지/게이트가 어디였지/포트가 뭐였지” 같은 **재발 노이즈를 0**으로 만든다.  
원칙: **한 가지 규격만** 사용한다(SSOT). “예전 서버/예전 포트/예전 키” 경로는 **사용 금지**.

---

## 0) 역할(SSOT)

- **로컬(Windows)**: 코드 수정/커밋/푸시, SSH/배포 트리거
- **API 서버(Nest, Docker)**: `dongdong-api` 컨테이너 실행/재빌드
- **WebView 서버(Next)**: `dev-client.dongdong.io` 컨텐츠 서빙(별도)

---

## 1) SSH SSOT (키/호스트/커맨드 규격)

### 1.1 SSOT 값(로컬에 1회 설정)

- **SSH Key(SSOT)**: `C:\Users\USER\.ssh\dd_backend`
- **SSH Host(SSOT)**: `ubuntu@api.dongdong.io`
- **ssh.exe 경로(SSOT)**: `C:\Windows\System32\OpenSSH\ssh.exe`
- **scp.exe 경로(SSOT)**: `C:\Windows\System32\OpenSSH\scp.exe`

> 규칙: Windows PowerShell에서는 반드시 `--%`를 사용한다(파워셸 파싱 노이즈/옵션 오해 방지).

### 1.2 원격 명령 템플릿(SSOT)

PowerShell:

```powershell
$ssh = "C:\Windows\System32\OpenSSH\ssh.exe"
$key = "C:\Users\USER\.ssh\dd_backend"
$host = "ubuntu@api.dongdong.io"

& $ssh --% -i $key -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o LogLevel=ERROR $host "bash -lc 'hostname'"
```

---

## 2) API 서버 반영(배포) — 단일 레일

### 2.1 배포 디렉토리/컨테이너(SSOT)

- **Repo dir**: `/opt/dongdong/dongdong-nest`
- **Compose**: `/opt/dongdong/dongdong-nest/docker-compose.api.yml`
- **Container**: `dongdong-api`
- **Port**: `3000`

### 2.2 표준 반영 명령(SSOT)

```bash
cd /opt/dongdong/dongdong-nest
docker compose -f docker-compose.api.yml up -d --build api
docker logs -f dongdong-api
```

### 2.3 Git pull이 막힐 때(서버에 GitHub 인증이 없을 때) — 허용되는 임시 레일

원칙적으로 서버는 `git pull`이 가능해야 한다(추후 Deploy Key/PAT로 고정).  
다만 **긴급 전투 모드**에서는 아래 “단일 파일 덮어쓰기 + 재빌드”를 허용한다.

PowerShell:

```powershell
$scp = "C:\Windows\System32\OpenSSH\scp.exe"
$ssh = "C:\Windows\System32\OpenSSH\ssh.exe"
$key = "C:\Users\USER\.ssh\dd_backend"
$host = "ubuntu@api.dongdong.io"

# 1) 파일 업로드(예: Nest entry)
& $scp --% -i $key -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL `
  gitwork/dongdong-nest/src/main.ts `
  $host:/opt/dongdong/dongdong-nest/src/main.ts

# 2) 재빌드/재시작
& $ssh --% -i $key -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o LogLevel=ERROR `
  $host "bash -lc 'cd /opt/dongdong/dongdong-nest && docker compose -f docker-compose.api.yml up -d --build api'"
```

---

## 3) 관측(재발 방지) — rid + auth=1/0

목표: “authAttached=1인데도 401” 같은 사건을 **서버 로그 1줄로 확정**한다.

- 앱(Guardian/WebView DBG): `rid=...` 확보
- 서버(dongdong-api): `docker logs dongdong-api | grep -F "<rid>" -n`
- 판정:
  - `auth=0` → 중간 프록시/브릿지에서 Authorization 드랍
  - `auth=1` + 401 → 토큰 자체/서버 인증 로직 문제

---

## 4) 금지(SEALED)

- 서버에서 RN(Android) 빌드 수행 금지(Codemagic SSOT)
- 서버에서 키스토어/민감정보 파일 저장 금지
- “예전 호스트/예전 포트/예전 키”로 접속 시도 금지(SSOT 밖)

