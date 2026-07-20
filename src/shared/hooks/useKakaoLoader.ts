import { useEffect, useState } from "react";

const KAKAO_SDK_SCRIPT_ID = "kakao-map-sdk";

/** 여러 컴포넌트에서 훅을 동시에 써도 스크립트 태그가 한 번만 추가되도록 프로미스를 모듈 스코프에 캐싱 */
let kakaoLoaderPromise: Promise<void> | null = null;

const loadKakaoSdk = () => {
  if (!kakaoLoaderPromise) {
    kakaoLoaderPromise = new Promise<void>((resolve, reject) => {
      if (window.kakao?.maps?.Map) {
        resolve();
        return;
      }

      const appKey = import.meta.env.VITE_KAKAO_JS_KEY;
      if (!appKey) {
        reject(
          new Error(
            "카카오 지도 API 키가 설정되지 않았습니다. .env 파일의 VITE_KAKAO_JS_KEY를 확인해주세요.",
          ),
        );
        return;
      }

      const handleLoad = () => window.kakao.maps.load(() => resolve());
      const existingScript = document.getElementById(
        KAKAO_SDK_SCRIPT_ID,
      ) as HTMLScriptElement | null;

      if (existingScript) {
        // load 이벤트가 이미 지난 경우를 대비해 즉시 초기화 경로를 제공
        if (window.kakao?.maps) {
          handleLoad();
        } else {
          existingScript.addEventListener("load", handleLoad, { once: true });
        }
        return;
      }

      const script = document.createElement("script");
      script.id = KAKAO_SDK_SCRIPT_ID;
      script.async = true;
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
      script.addEventListener("load", handleLoad);
      script.addEventListener("error", () => {
        kakaoLoaderPromise = null;
        reject(new Error("카카오 지도 SDK 로드에 실패했습니다."));
      });
      document.head.appendChild(script);
    });
  }

  return kakaoLoaderPromise;
};

/** 카카오 지도 SDK 스크립트를 로드하고, 로드 완료 여부/에러 메시지를 반환하는 훅 */
export const useKakaoLoader = () => {
  const [isLoaded, setIsLoaded] = useState(!!window.kakao?.maps?.Map);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded) return;

    let isMounted = true;

    loadKakaoSdk()
      .then(() => {
        if (isMounted) setIsLoaded(true);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [isLoaded]);

  return { isLoaded, error };
};
