Dự án này được xây dựng bằng NextJS. Kiến trúc chính của dự án đang sử dụng React ContextAPI để thay thế cho việc sử dụng các thư viện quản lý State khác. Mục tiêu của dự án nhằm xây dựng một concept chung cho cả Web và App. Hạn chế phụ thuộc vào các thư viện State Management bên ngoài.

# Giới Thiệu Chung

Vì dự án đang được xây dựng dựa bên NextJS và React ContextAPI do vậy cần người sử dụng phải nắm vững các kiến thức của 2 thành phần này trước khi bắt đầu vào với dự án này.

- Hiểu về SSR và SSG của NextJS.
- Hiểu cách routing của NextJS thông qua folder page.
- Các kiến thức cơ bản của functional component.
- Nắm các hook cơ bản của react (useState, useEffect, useRef, forwardRef,...).
- Hiểu và biết cách viết một custom hook.
- Hiểu ContextAPI hoạt động để truyền dữ liệu tới một component cụ thể, biết cách viết một Provider đơn giản bằng React ContextAPI.

# Mục lục

1. Vì sao phải dùng Context API.
2. Cấu trúc thư mục của dự án.
3. Quản lý State (lớp Provider) trong dự án.
4. Cách sử dụng RouteProvider cho người mới. (sử dụng addRule, toUrl, push, breadcrumbs).
5. Về styling và các icons trong dự án. (sử dụng classnames và module.scss, ví dụ về cách sử dụng cx).
6. Tech stack của dự án: tailwindcss, scss, formik, styled, lodash, classnames.
7. Các quy ước chung của dự án:

   7.1 Như thế nào thì sẽ define thành một Provider.

   7.2 Phân biệt hook và provider.

   7.3 Nên define initial language ngay từ đầu.

## 1. Vì sao phải dùng Context API?

Việc truyền dữ liệu từ components cha xuống component con thông thường ta sẽ truyền qua props, nhưng đối với một số lượng components lồng nhau lớn thì việc này sẽ dài dòng và khó kiểm soát, sẽ có rất nhiều components đóng vai trò là con đường vận chuyển dữ liệu, thay vì trực tiếp sử dụng dữ liệu đó. Vì vậy sử dụng Context API sẽ giúp mình truyền trực tiếp dữ liệu tới component nhận và không phải thông qua các components khác.

Ví dụ:

```javascript
const Context = React.createContext()

const View = () => {
    const [page, setPage] = React.useState(0);
    const data = bigQuery(page);
    return (
        <Context.Provider value={{ data }}>
            <Parent />
        </Context.Provider>
    );
}
const Parent = () => {
    return <ChildOfParent />
}
const ChildOfParent = () => {
    const { data } = React.useContext(Context);
    return <>{data.map((item) => { ...})}</>
}

```

## 2. Cấu trúc thư mục của dự án.

- Hệ thống folder của dự án sẽ tương tự như một hệ thống folder của một dự án NextJS, chúng ta sẽ có các folders sau:

* pages: tạo các routes cho dự án.
* providers: là context API dùng để quản lý state cho dự án.
* hooks: là các custom hook của dự án.
* gstyles: là nơi lưu trữ font, setup tailwind config, màu sắc chung, icons.
* translations: chứa các config liên quan tới ngôn ngữ cho dự án, đang sử dụng i18n.

## 3. Quản lý State (lớp Provider) trong dự án.

Như đã nói ở trên lớp providers được sử dụng bằng Context API dùng để quản lý state cho dự án. Các Context API này sẽ đặt các context provider lồng nhau thành một cây dữ liệu. Một provider trong dự án đóng vai trò là quản lý và cung cấp các methods cho một tính năng nhất định, như: `AuthProvider` sẽ liên quan tới việc quản lý Auth cho dự án, cung cấp các method như login, refresh token. Quản lý dữ liệu của user.

Ví dụ:

```javascript
export default function Wrapper({ children, ...props }: AppWrapperProps) {
  const value = [
    RefProvider,
    PageProvider,
    TranslationProvider,
    AuthProvider,
    RouteProvider,
    BookingProvider,
  ];
  return value.reduceRight((acc, Component: any) => {
    return React.createElement(Component, props, acc);
  }, children);
}
```

Điều này tương đương

```javascript
<RefProvider>
  <PageProvider>
    <TranslationProvider>
      <AuthProvider>
        <RouteProvider>
          <BookingProvider
            {children}
          </BookingProvider>
        </RouteProvider>
      </AuthProvider>
    </TranslationProvider>
  </PageProvider>
</RefProvider>
```

### Cây Dữ Liệu Của Dự Án

Như vậy dựa vào tính chất của `Context API`ta sẽ có 1 cây dữ liệu như sau:

- `RefProvider` => `PageProvider` => `TranslationProvider` => `AuthProvider` => `RouteProvider` => `BookingProvider`.
  Đặc điểm của `Context API`, là các node con sẽ có thể gọi để sử dụng các dữ liệu của các `Context` trên node cha, tuy nhiên sẽ không thể có chiều ngược lại. Dữ liệu sẽ được đổ từ các `Provider` ngoài cùng dần vào các `Provider` bên trong, đây là đặc điểm cơ bản của `Context API`.
  Và sẽ không có vấn đề gì nếu luồng dữ liệu đi từ trên xuống dưới như vậy. Tuy nhiên trong nhiều trường hợp thực tế thì node cha vẫn có khả năng sử dụng dữ liệu của node con,

Ví dụ: Giả định trường hợp `TranslationProvider` đang cần sử dụng dữ liệu của User để biết User đó đã chọn ngôn ngữ như thế nào để cập nhật lại ngôn ngữ cho chính xác thì `TranslationProvider` phải cần dữ liệu của `AuthProvider`, tuy nhiên sẽ không thể gọi trược tiếp dữ liệu trong trường hợp này được vì `AuthProvider` đang là node con của `TranslationProvider`. Trường hợp này mình đưa `currentLanguage` ra các lớp `Provider` bên ngoài, từ đó `RefProvider` được sinh ra để làm việc này. Khi đó dữ liệu `currentLanguage`sẽ được set ra lớp `RefProvider`này, và `TranslationProvider` sẽ sử dụng được `currentLanguage` thông qua `RefProvider`.

Lưu ý: Việc `RefProvider` (core) được sinh ra để mục đích giao tiếp giữa các `Providers` cho trường hợp cần hoisting dữ liệu, các trường hợp dữ liệu trong dự án thì không được sử dụng `RefProvider` để hoisting vì sẽ gây khó trong việc kiểm soát dòng chảy dữ liệu và bảo trì dự án.

### Cách Call Dữ Liệu Của Một Provider.

Giả định tại một component bất kì là node con của `WrapperProvider`, ta muốn sử dụng `Transalation`để dịch thuật thì làm như sau:

- Bước 1: `import { useTranslationContext } from "@providers/TranslationProvider";`
- Bước 2:
  - Gọi `useTranslationContext()` trong component muốn sử dụng: `const { i18n, Trans } = useTranslationContext();`.
  - Trong đó `i18n`, `Trans` là giá trị của `TranslationProvider` được thực thi trước đó trong file `TranslationProvider.tsx`.

Concept này được sử dụng tương tự cho các `Provider` khác xuyên suốt trong toàn bộ dự án. Ta cũng sẽ có tương ứng các `useRouteContext`, `usePageContext`,... cho các `Provider` khác.

## 4. Cách sử dụng RouteProvider cho người mới.

Để có 1 route mới thì mình cần tạo thêm 1 route trong folder pages (phần này là của NextJS mình xem thêm docs để nắm chi tiết).
Tiếp theo như đã nói ở trên mỗi một `Provider` trong dự án sẽ quản lý dữ liệu và các methods cho một tính năng tương ứng, `RouteProvider` cũng không ngoại lệ. `RouteProvider` là nơi cài đặt và cung cấp các methods cần thiết để sử dụng cho việc routing của dự án.

Sau khi tạo thêm 1 route trong folder pages, ta cần nắm thêm một số hàm cơ bản trong file `RouteProvider.tsx` sau đây: `addRule`, `toUrl`, `push`, `breadcrumbs`.

```javascript
import routeStore, { helper } from "@utils/routeStore";
import i18n from "@translations/i18n";

routeStore.addRule("productDetail", {
  url: (params?: object) => {
    return helper.url("product-detail", params);
  },
  breadcrumbs: (params: object) => {
    return _.get(params, "breadcrumbs", [
      {
        name: i18n.t("Product.title"),
      },
    ]);
  },
});
```

### `addRule` (\* tương lai sẽ được gơm lại vào useNextRoute.tsx)

- Hàm nắm vai trò thêm một số `methods` sẵn vào cho một `route`. Cấu trúc của hàm này sẽ như sau:

```javascript
addRule(<ruleName>, {
   url: () => string
   breadcrumbs: () => [...]
})
```

Trong đó:

- Đối số thứ nhất `ruleName` là tên người dùng đặt, đặt cái gì cũng được, nhưng mình nên quy ước sẽ đặt theo chuẩn ví dụ mình có route là `product-detail` thì `ruleName` là `productDetail`. `ruleName` này cũng sẽ được sử dụng tương ứng cho các hàm `toUrl` và `push` sau đó.
- Đối số thứ hai là một `object`, `object` này hiện tại có 2 methods là `url` và `breadcrumbs`. Hai hàm này sẽ được lưu trữ và sử dụng trong core để hỗ trợ xây dựng biến `router` là giá trị của `RouteProvider`.
  - Hàm `url` trả về một `path` của `route` tương ứng. Để hiểu thêm cách xây dựng hàm `url` này thì có thể đọc thêm phần `helper` trong `routeStore` - phần này được viết sẵn để truyền `id` hoặc `slug` nếu có vào trong `url`. Dev mới cũng có thể không cần đọc, chỉ cần biết cách sử dụng là được.
  - Hàm `breadcrumbs` là xây dựng một mảng `breadcrumbs` sẵn dùng để gọi lại sau này khi sử dụng.

### `toUrl` (\* tương lai sẽ phải đổi tên hàm thành `getUrl` cho hợp ngữ cảnh sử dụng).

- Hàm để trả về url string. Ví dụ: để lấy link `/product-detail` mà mình đã define trước đó trong khi dùng `addRule`.
- Cách sử dụng `router.toUrl('productDetail', { slug: 'san-pham-1' })`. Kết quả mình sẽ có một url string như sau: `/en/product-detail/san-pham-1` hoặc `/vi/product-detail/san-pham-1`, tùy vào giá trị `currentLanguage` lúc đó.

### `push`

- Tương tự `toUrl`, hàm `push` này để `direct` vào `route` tương ứng với `ruleName` đã được define trước đó khi dùng `addRule`.
- Cách dùng: `router.push('productDetail', { slug: 'san-pham-1'})`. Hàm sẽ direct tới `/en/product-detail/san-pham-1` hoặc `/vi/product-detail/san-pham-1`, tùy vào giá trị `currentLanguage` lúc đó.

### `breadcrumbs`

- Cho trường hợp mà `addRule` có `methods` thì router lúc này có thể call hàm này để sử dụng.
- Các dùng: `router.breadcrumbs('productDetail')`. Hàm trả về mảng giá trị breadcrumbs tương ứng (việc này cũng tùy thuộc vào người dev setup trước đó ở method breadcrumbs của addRule).

## 5. Về Styling và Icons

### Folder `styles`và Folder `gstyles`:

- Về styling sẽ có 2 folders chính. Các styling global scss của dự án đang được đặt ở folder `styles`. Các phần config về tailwindcss, icons, colors, fonts và một số styling core thì sẽ đặt ở `gstyles`.

- `styles/globals.scss`file lưu các biết chung (`:root`) các styling chung, và overwrite các thư viện sẽ thông qua file này. Trong file này sẽ add dòng code `@import "@gstyles/tailwind/style.scss";`, các phần nay thông thường sẽ được setup sẵn trong dự án mẫu.
- `gstyles/style.scss`file cài đặt `font-face` và styling chung `text-ellipsis-<index>` (`index`: 1 -> 10).
- `gstyles/tailwind/index.js` file config của tailwindcss - file này sẽ required `gstyles/styleguide/colors.js`, `gstyles/styleguide/fontSize.js`, `gstyles/styleguide/borderRadius.js` .

### `gstyles.icons`

- Đối với các icon svg không có animation mình sẽ copy file svg vào folder `gstyles/styleguide/icons/svgs`.
- Sau đó sử dụng nhanh mà không cần `import` thông qua:

```javascript
import gstyles from '@gstyles/index';
gstyles.icons({name: <tên file>, size, color })
```

### Một số quy ước chung

- Hạn chế sử dụng classnames inline của tailwind để lên layout, responsive và anim cho component. Vì sẽ khó maintain. Việc này mình tạo thêm file module.scss và gơm styling cũng như sử dụng thêm breakpoint để làm responsive, ở component tương ứng.
- Một tip nhỏ nữa là sử dụng thư viện `classnames`để kiểm tra các trường hợp className đúng sai. Ví dụ:
  - `import cx from 'classnames';`.
  - `className={!!active ? 'active' : ''}` => `className={cx({'active': !!active})}`
  - `` className={`${class1} ${class2} ${class3}`} `` =>`className={cx(class1, class2, class3)}`.
  - Cách dùng của `classnames`:
    - Viết nhiều cases: `cx('foo', {xa bar: true, duck: false }, 'baz', { quux: true })` // => 'foo bar baz quux'
    - Trường hợp bị bỏ qua: `cx(null, false, 'bar', undefined, 0, 1, { baz: null }, '')` // => 'bar 1'

## 6. Tech stack của dự án

Dự án core sẽ xài một số thư viện: tailwindcss, scss, formik, styled, lodash, classnames.
Trường hợp các dự án làm anim sẽ có: locomotive-scroll, gsap, swiperjs,

## 7. Các quy ước chung của dự án.

Các quy ước dưới đây đang hỗ trợ cho kiến trúc này, nó mang tính cá nhân của tác giả, không phải là quy định của `React` về việc hiện thực các mã nguồn (custom `hook`, `Provider`) hay ở các dự án sử dụng `React` khác.

### 7.1 Khi nào thì sẽ define thành một `Provider`?

- Khi có 1 tính năng phát sinh của dự án,dữ liệu sẽ được dùng lại ở nhiều nơi, các flow logic tương đối nhiều và phức tạp, thì ta gơm logic đó thành một `Provider` và trả về một `instance`, mọi thay đổi về logic và dữ liệu thì components sẽ tương tác thông qua các `instance`của `Provider` cung cấp.

- Các tính chất của một `Provider`:
  - Có thể dùng lại dữ liệu ở nhiều nơi (component khác nhau).
  - Logic lớn.
  - Hỗ trợ một tính năng lớn cụ thể nào đó. Ví dụ: Authentication, Booking, Payment, Translation, Route,...

### 7.2 Phân biệt `hook` và `Provider`.

- Cusom `Hook` cũng là dùng để gơm logic chung và sử dụng ở nhiều chỗ đặc điểm của các logic chung này thì thường không quá lớn và phức tạp và có tính độc lập cao hơn `Provider`.

- Các tính chất của một custom `Hook`:
  - Sử dụng trong functional component cụ thể.
  - Logic nhỏ và độc lập.
  - Hỗ trợ một tính năng duy nhất cụ thể. Ví dụ: useLocalStorage, useWindowSize, useCountdown, usePromise, usePagination, useFilter,...

### 7.3 Nên define initial language ngay từ đầu.

Đối với các dự án có sử dụng ngôn ngữ mình code dịch thuật khi lên layout ngay từ đầu, để giảm tải công việc cập nhật về sau, việc này sử dụng thông qua `TranslationProvider`.

Ví dụ:

Bước 1: import `useTranslationContext`.
`import { useTranslationContext } from "@providers/TranslationProvider";`
Bước 2: sử dụng `useTranslationContext` ở component cần dùng.
`const { i18n, Trans } = useTranslationContext();`
Bước 3: Sử dụng `i18n` hoặc `Trans`tùy mục đích sử dụng.

- `i18n`: `i18n.t("ContactUs.addressAmanakiThaoDien")`.
- `Trans`:
  ```javascript
  <Trans
    i18nKey={"Discover.BlockEvents.findMore"}
    components={[<br key="trans_0" />]}
  />
  ```

* Các đường dẫn của đối số của hàm `i18n.t`cũng như `prop i18nKey` của component `Trans`sẽ được define trong folder `translations/lang`, tùy thuộc vào dự án mà trong đây sẽ có các file như `vi.ts`, `en.ts`,... để define các giá trị ban đầu cho ngôn ngữ. Sau này sẽ update lại thì update vào file này sẽ đỡ công sức dò tìm.
