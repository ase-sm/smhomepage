// 화면 목록 데이터 (Figma: 260928_v0.42 / N-메뉴구조도-01 1308:1328 기준)
// 화면 ID·화면명·Depth·진입 경로·주요 구성은 기획서 값 그대로, path·status 는 현재 구현 기준

/** done: 기획서 기준 구현 완료 / partial: 경로만 있고 콘텐츠 준비 중 / todo: 미구현 / hidden: 기획상 숨김 */
export type ScreenStatus = 'done' | 'partial' | 'todo' | 'hidden'

export type Screen = {
  id: string
  name: string
  depth: string
  /** 기획서의 진입 경로 */
  entry: string
  /** 주요 구성 */
  parts: string
  status: ScreenStatus
  /** 사이트 내 경로 (없으면 링크 없음) */
  path?: string
  /** 외부 주소 (메일 확인 등) */
  href?: string
  note?: string
}

export type ScreenGroup = { key: string; title: string; description: string; screens: Screen[] }

export const STATUS_LABEL: Record<ScreenStatus, string> = {
  done: '완료',
  partial: '준비 중',
  todo: '미구현',
  hidden: '숨김',
}

export const SCREEN_GROUPS: ScreenGroup[] = [
  {
    key: 'site',
    title: '홈페이지',
    description: 'GNB 1Depth 4개(AX / R&D / Solution / About Us)와 News, 문의하기, 공통 영역입니다.',
    screens: [
      {
        id: 'N-공통-01',
        name: '공통 (헤더 · 푸터)',
        depth: '-',
        entry: '전 화면',
        parts: '헤더 · 푸터 · 하단 CTA · 플로팅 [문의] · [TOP] 버튼',
        status: 'done',
        path: '/news',
        note: '모든 홈페이지 화면에 적용',
      },
      {
        id: 'N-메인-01',
        name: '메인',
        depth: '1',
        entry: '로고 / 브라우저 최초 진입',
        parts: '히어로 · WHY US · OUR BUSINESS · TECHNOLOGY · SOLUTION · WITH US',
        status: 'todo',
        note: '현재 / 접속 시 화면 목록, 로고 클릭 시 News 로 이동',
      },
      {
        id: 'N-AX-01',
        name: 'AX',
        depth: '1',
        entry: 'GNB / 메인 AX',
        parts: '히어로 · 도입 상황 · 대표 성과 · 수행 범위 · 주요 실적',
        status: 'partial',
        path: '/ax',
      },
      {
        id: 'N-AX-01-01',
        name: 'AX 사업 콘텐츠',
        depth: '1',
        entry: '헤더 > AX',
        parts: '분야별 AX 사업 콘텐츠',
        status: 'todo',
      },
      {
        id: 'N-R&D-01',
        name: 'R&D',
        depth: '1',
        entry: 'GNB / 메인 R&D',
        parts: '히어로 · 연구 흐름 · 핵심 연구 기술 · 주요 연구 영역 · 주요 실적',
        status: 'partial',
        path: '/rnd',
      },
      {
        id: 'N-Solution-01',
        name: 'Solution - Ternis RAG',
        depth: '1',
        entry: 'GNB / 메인 Solution',
        parts: '히어로 · 제품 탭(RAG / MLOps / Agent) · 제품별 상세',
        status: 'partial',
        path: '/solution/rag',
        note: 'Solution 진입 기본값',
      },
      {
        id: 'N-Solution-02',
        name: 'Solution - Ternis MLOps',
        depth: '탭',
        entry: 'Solution 화면 내 탭',
        parts: '제품 탭 · 제품 상세',
        status: 'partial',
        path: '/solution/mlops',
      },
      {
        id: 'N-Solution-03',
        name: 'Solution - Ternis Agent',
        depth: '탭',
        entry: 'Solution 화면 내 탭',
        parts: '제품 탭 · 제품 상세',
        status: 'partial',
        path: '/solution/agent',
      },
      {
        id: '-',
        name: 'Solution - Kyston',
        depth: '2',
        entry: '메인 Solution / GNB 하위',
        parts: '-',
        status: 'hidden',
        note: '오픈 전까지 하위 메뉴에서 숨김',
      },
      {
        id: 'N-Aboutus-01',
        name: 'About Us',
        depth: '1',
        entry: 'GNB',
        parts: '미션 · 비전 · 연혁 · 오시는 길',
        status: 'partial',
        path: '/about',
      },
      {
        id: 'N-news-01',
        name: '세명 뉴스 (목록)',
        depth: '1',
        entry: 'GNB',
        parts: '텍스트 목록 5건 · 마우스 오버 뉴스 미리보기(이미지 · 요약) · 페이지네이션',
        status: 'done',
        path: '/news',
      },
      {
        id: 'N-news-02',
        name: '세명 뉴스 (상세)',
        depth: '2',
        entry: 'News 목록 > 상세',
        parts: '제목 · 날짜 · 요약 · 본문 · 출처(원문 보기) · 목록으로',
        status: 'done',
        path: '/news',
        note: '목록에서 뉴스 선택',
      },
      {
        id: 'N-문의-01',
        name: '문의하기',
        depth: '1',
        entry: '본문 CTA / 하단 CTA 바 / 플로팅 버튼',
        parts: '접수 절차 안내 · 입력 폼 · 확인 / 완료 / 실패 모달',
        status: 'done',
        path: '/inquiry',
      },
      {
        id: 'N-문의-01-01',
        name: '문의 메일',
        depth: '-',
        entry: '문의하기 > 메일',
        parts: '접수 확인 메일(문의자) · 접수 알림 메일(담당자)',
        status: 'done',
        href: 'http://localhost:8025',
        note: 'Mailpit 에서 확인 (개발용)',
      },
      {
        id: 'N-AI윤리원칙-01',
        name: 'AI 윤리원칙',
        depth: '모달',
        entry: '푸터',
        parts: '3개 원칙 · 항목별 설명',
        status: 'todo',
        note: '푸터 문구만 있음',
      },
    ],
  },
  {
    key: 'admin',
    title: '관리자',
    description: '뉴스 관리 화면입니다. 접속 시 로그인이 필요합니다. (아이디: admin / 비밀번호: admin1234)',
    screens: [
      {
        id: 'A-뉴스관리-01',
        name: '뉴스 관리 목록',
        depth: '1',
        entry: '관리자 > 뉴스 관리',
        parts: '상태 · 검색어 검색 · 10/30/50개 · 페이지네이션',
        status: 'done',
        path: '/admin/news',
      },
      {
        id: 'A-뉴스관리-02',
        name: '뉴스 관리 (등록 · 수정)',
        depth: '2',
        entry: '관리자 > 뉴스 관리 > 등록 · 수정',
        parts: '에디터 · 이미지 업로드 · 예약 확인 · 이탈 확인',
        status: 'done',
        path: '/admin/news/new',
      },
      {
        id: 'A-뉴스관리-03',
        name: '뉴스 관리 (상세)',
        depth: '2',
        entry: '관리자 > 뉴스 관리 > 상세',
        parts: '뉴스 정보 · 삭제 / 수정',
        status: 'done',
        path: '/admin/news',
        note: '목록에서 뉴스 선택',
      },
    ],
  },
]
