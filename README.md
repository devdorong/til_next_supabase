# Shadcn

- https://ui.shadcn.com/

## 1. 설치

```bash
npx shadcn@latest init
```

## 2. 생성되어지는 파일 살펴보기

- `/components.json` 파일 자동 생성됨. (설정 파일)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
```

- `/lib/utils.ts` 파일 자동 생성됨. (css 클래스들을 합쳐줌)

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 3. 활용해보기

### 3.1. 예제 1.

```bash
npx shadcn@latest add button card input label
```

- `/src/components/ButtonTest.tsx 파일` 생성
