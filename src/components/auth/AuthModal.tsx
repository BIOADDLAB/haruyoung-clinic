'use client';

import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ID_TAKEN_CODE, signIn, signUp } from '@/lib/members';
import { DUR, EASE } from '@/lib/motion';
import { useMounted } from '@/lib/useMounted';
import PrivacyModal from '@/components/ui/PrivacyModal';

const field =
    'w-full border-b border-dark/25 bg-transparent px-1 py-2.5 text-caption text-dark outline-none transition-colors duration-500 ease-brand placeholder:text-dark/35 focus:border-dark';

/** 숫자와 +, - 만 받는다. 국가마다 형식이 달라 하이픈을 자동으로 넣지 않는다 */
const cleanPhone = (v: string) => v.replace(/[^\d+-]/g, '').slice(0, 20);

const ID_RULE = /^[a-z0-9]{4,16}$/;

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const reduced = useReducedMotion();
    const mounted = useMounted();

    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [loginId, setLoginId] = useState('');
    const [pw, setPw] = useState('');
    const [pw2, setPw2] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [agree, setAgree] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const [privacy, setPrivacy] = useState(false);

    const t = useTranslations('auth');
    const tr = useTranslations('reservation');

    /**
     * 닫으면서 초기 상태로 되돌린다.
     * 안 그러면 다음에 열 때 회원가입 화면이 그대로 뜬다.
     * effect 가 아니라 닫는 행동 자체가 초기화 시점이라 여기에 둔다.
     */
    const reset = useCallback(() => {
        setMode('login');
        setLoginId('');
        setPw('');
        setPw2('');
        setName('');
        setPhone('');
        setAgree(false);
        setError('');
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (!open) return;
        document.body.classList.add('overflow-hidden');
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && reset();
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.classList.remove('overflow-hidden');
            window.removeEventListener('keydown', onKey);
        };
    }, [open, reset]);

    const swap = (next: 'login' | 'signup') => {
        setMode(next);
        setError('');
        setPw('');
        setPw2('');
    };

    const submit = async () => {
        setError('');
        setBusy(true);
        try {
            if (mode === 'login') {
                if (!loginId.trim() || !pw) return setError(t('errEmpty'));
                await signIn(loginId, pw);
                reset();
                return;
            }

            if (!name.trim()) return setError(tr('errName'));
            if (phone.replace(/\D/g, '').length < 8) return setError(tr('errPhone'));
            if (!ID_RULE.test(loginId.trim().toLowerCase())) return setError(t('errIdRule'));
            if (pw.length < 6) return setError(t('errPwShort'));
            if (pw !== pw2) return setError(t('errPwMismatch'));
            if (!agree) return setError(t('errAgree'));

            await signUp({
                loginId: loginId.trim().toLowerCase(),
                name: name.trim(),
                phone,
                password: pw,
                createdAt: Date.now(),
            });
            alert(t('signupDone', { name: name.trim() }));
            reset();
        } catch (e) {
            if (mode === 'login') return setError(t('errLogin'));
            // 이미 쓰는 아이디면 Firebase Auth 가 이 코드를 준다
            const code = (e as { code?: string })?.code;
            setError(code === ID_TAKEN_CODE ? t('errIdTaken') : t('errSignup'));
        } finally {
            setBusy(false);
        }
    };

    if (!mounted) return null;
    const signup = mode === 'signup';

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label={signup ? t('signup') : t('login')}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DUR.fast, ease: EASE }}
                    onClick={reset}
                    className="fixed inset-0 z-60 flex items-center justify-center bg-dark/70 px-6 py-10 backdrop-blur-sm"
                >
                    <motion.div
                        initial={reduced ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: DUR.base, ease: EASE }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex max-h-full w-full max-w-[420px] flex-col overflow-hidden bg-cream"
                    >
                        {/* 모달은 화면 안에 갇히고 안쪽만 스크롤된다 */}
                        <div className="overflow-y-auto overscroll-contain px-8 py-12 lg:px-12">
                            <div className="flex justify-center">
                                {signup ? (
                                    <p className="font-gara text-24 italic text-brown">{t('welcome')}</p>
                                ) : (
                                    <Image
                                        src="/images/logo-sub.svg"
                                        alt={t('brand')}
                                        width={110}
                                        height={24}
                                        priority
                                    />
                                )}
                            </div>
                            <h2 className="mt-3 text-center text-22 font-bold">{signup ? t('signup') : t('login')}</h2>

                            <div className="mt-10 flex flex-col gap-6">
                                {signup && (
                                    <>
                                        <label className="flex flex-col gap-2">
                                            <span className="text-caption-sm font-semibold">
                                                {tr('name')} <span className="text-red-500">*</span>
                                            </span>
                                            <input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder={tr('namePlaceholder')}
                                                className={field}
                                            />
                                        </label>

                                        <label className="flex flex-col gap-2">
                                            <span className="text-caption-sm font-semibold">
                                                {tr('phone')} <span className="text-red-500">*</span>
                                            </span>
                                            <input
                                                type="tel"
                                                inputMode="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(cleanPhone(e.target.value))}
                                                placeholder={tr('phonePlaceholder')}
                                                className={field}
                                            />
                                        </label>
                                    </>
                                )}

                                <label className="flex flex-col gap-2">
                                    <span className="text-caption-sm font-semibold">
                                        {t('loginId')} {signup && <span className="text-red-500">*</span>}
                                    </span>
                                    <input
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                                        autoCapitalize="none"
                                        placeholder={signup ? t('loginIdRule') : t('loginIdPlaceholder')}
                                        className={field}
                                    />
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-caption-sm font-semibold">
                                        {t('password')} {signup && <span className="text-red-500">*</span>}
                                    </span>
                                    <input
                                        type="password"
                                        value={pw}
                                        onChange={(e) => setPw(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !signup && submit()}
                                        placeholder={signup ? t('passwordRule') : t('passwordPlaceholder')}
                                        className={field}
                                    />
                                </label>

                                {signup && (
                                    <label className="flex flex-col gap-2">
                                        <span className="text-caption-sm font-semibold">
                                            {t('passwordConfirm')} <span className="text-red-500">*</span>
                                        </span>
                                        <input
                                            type="password"
                                            value={pw2}
                                            onChange={(e) => setPw2(e.target.value)}
                                            placeholder={t('passwordConfirmPlaceholder')}
                                            className={field}
                                        />
                                    </label>
                                )}
                            </div>

                            {signup && (
                                <div className="mt-9 flex items-center justify-between gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setAgree(!agree)}
                                        aria-pressed={agree}
                                        className="flex items-center gap-3"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 ease-brand ${
                                                agree ? 'border-dark bg-dark' : 'border-dark/30'
                                            }`}
                                        >
                                            {agree && (
                                                <svg
                                                    viewBox="0 0 12 12"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className="h-2.5 w-2.5 text-cream"
                                                >
                                                    <path
                                                        d="M1 6l3.5 3.5L11 2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </span>
                                        <span className="text-caption-sm lg:text-caption">
                                            (필수) 개인정보 수집 이용 동의
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPrivacy(true)}
                                        className="shrink-0 text-caption-sm text-dark/60 underline"
                                    >
                                        {tr('detail')}
                                    </button>
                                </div>
                            )}

                            {error && <p className="mt-6 text-center text-caption-sm text-red-500">{error}</p>}

                            <button
                                type="button"
                                onClick={submit}
                                disabled={busy}
                                className="mt-8 w-full bg-dark py-3.5 text-caption font-semibold text-cream transition-colors duration-500 ease-brand hover:bg-brown disabled:opacity-50"
                            >
                                {busy ? t('checking') : signup ? t('submitSignup') : t('submitLogin')}
                            </button>

                            {/* #TODO: 카카오 로그인은 후순위.
                        <button
                            type="button"
                            className="mt-3 w-full bg-[#fee500] py-3.5 text-caption font-semibold text-[#191600]"
                        >
                            카카오로 시작하기
                        </button> */}

                            <button
                                type="button"
                                onClick={() => swap(signup ? 'login' : 'signup')}
                                className="mt-6 w-full text-center text-caption font-semibold"
                            >
                                <span className="border-b border-dark pb-0.5">{signup ? t('login') : t('signup')}</span>
                            </button>
                        </div>
                    </motion.div>
                    <PrivacyModal open={privacy} onClose={() => setPrivacy(false)} />
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
