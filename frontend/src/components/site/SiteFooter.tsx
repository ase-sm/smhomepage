import { Link } from 'react-router-dom'
import { ArrowRightIcon, ArrowUp02Icon, LogoMark, LogoText } from '../../assets/icons'
import naverBlogLogo from '../../assets/naver-blog-logo.png'
import { BLOG_URL } from './menu'
import './SiteFooter.css'

type Props = {
  /** 문의 배너 노출 여부 (문의하기 화면에서는 숨김) */
  showBanner?: boolean
}

/** Footer: 문의 배너 (Figma 286:45837) + 회사 정보·TOP 버튼 (Figma 140:14864) */
export default function SiteFooter({ showBanner = true }: Props) {
  return (
    <footer className="footer">
      {showBanner && (
        <div className="footer__banner-wrap">
          <section className="footer-banner" aria-label="문의 안내">
            <div className="footer-banner__text">
              <p className="footer-banner__title">궁금한 점이 있으신가요?</p>
              <p className="footer-banner__desc">세명소프트가 함께 고민하고 답하겠습니다.</p>
            </div>
            <Link to="/inquiry" className="footer-banner__button">
              문의하기
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </section>
        </div>
      )}

      <div className="footer__info">
        <div className="footer__top">
          <Link to="/news" className="footer__logo" aria-label="세명소프트 홈">
            <LogoMark className="footer__logo-mark" aria-hidden="true" />
            <LogoText className="footer__logo-text" aria-hidden="true" />
          </Link>
          <a className="footer__blog" href={BLOG_URL} target="_blank" rel="noopener noreferrer" aria-label="네이버 블로그 (새 창)">
            <img src={naverBlogLogo} alt="" />
          </a>
        </div>

        <div className="footer__body">
          <div className="footer__address">
            <p>서울 중구 청계천로 100 시그니처타워 서관 1033호 (본사)</p>
            <p>대표이사: 황바울</p>
            <p>smsoft@smsoft.kr</p>
          </div>
          <div className="footer__bottom">
            <span className="footer__policy">AI 윤리원칙</span>
            <p className="footer__copy">© 2026 by 주식회사 세명소프트. All rights reserved.</p>
          </div>
        </div>

        <button
          type="button"
          className="footer__top-button"
          aria-label="맨 위로"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp02Icon aria-hidden="true" />
        </button>
      </div>
    </footer>
  )
}
