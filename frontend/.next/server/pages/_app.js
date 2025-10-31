/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./src/pages/_app.jsx":
/*!****************************!*\
  !*** ./src/pages/_app.jsx ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/link */ \"./node_modules/next/link.js\");\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nfunction App({ Component, pageProps }) {\n    const [dark, setDark] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(false);\n    (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(()=>{\n        document.documentElement.classList.toggle(\"dark\", dark);\n    }, [\n        dark\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"min-h-screen bg-background text-foreground bg-app\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"header\", {\n                className: \"border-b/50 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"container flex h-14 items-center justify-between\",\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                            className: \"flex items-center gap-6\",\n                            children: [\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                                    href: \"/\",\n                                    className: \"font-semibold\",\n                                    children: \"Scraper Admin\"\n                                }, void 0, false, {\n                                    fileName: \"/home/vishal/Development/Scrapper/frontend/src/pages/_app.jsx\",\n                                    lineNumber: 16,\n                                    columnNumber: 13\n                                }, this),\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"nav\", {\n                                    className: \"hidden sm:flex items-center gap-4 text-sm text-muted-foreground\",\n                                    children: [\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                                            href: \"/shop\",\n                                            className: \"hover:text-foreground\",\n                                            children: \"Shop\"\n                                        }, void 0, false, {\n                                            fileName: \"/home/vishal/Development/Scrapper/frontend/src/pages/_app.jsx\",\n                                            lineNumber: 18,\n                                            columnNumber: 15\n                                        }, this),\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                                            href: \"/websites\",\n                                            className: \"hover:text-foreground\",\n                                            children: \"Websites\"\n                                        }, void 0, false, {\n                                            fileName: \"/home/vishal/Development/Scrapper/frontend/src/pages/_app.jsx\",\n                                            lineNumber: 19,\n                                            columnNumber: 15\n                                        }, this),\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                                            href: \"/products\",\n                                            className: \"hover:text-foreground\",\n                                            children: \"Products\"\n                                        }, void 0, false, {\n                                            fileName: \"/home/vishal/Development/Scrapper/frontend/src/pages/_app.jsx\",\n                                            lineNumber: 20,\n                                            columnNumber: 15\n                                        }, this),\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                                            href: \"/logs\",\n                                            className: \"hover:text-foreground\",\n                                            children: \"Logs\"\n                                        }, void 0, false, {\n                                            fileName: \"/home/vishal/Development/Scrapper/frontend/src/pages/_app.jsx\",\n                                            lineNumber: 21,\n                                            columnNumber: 15\n                                        }, this)\n                                    ]\n                                }, void 0, true, {\n                                    fileName: \"/home/vishal/Development/Scrapper/frontend/src/pages/_app.jsx\",\n                                    lineNumber: 17,\n                                    columnNumber: 13\n                                }, this)\n                            ]\n                        }, void 0, true, {\n                            fileName: \"/home/vishal/Development/Scrapper/frontend/src/pages/_app.jsx\",\n                            lineNumber: 15,\n                            columnNumber: 11\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                            onClick: ()=>setDark((v)=>!v),\n                            className: \"text-sm rounded-md border px-3 py-1.5 hover:bg-accent\",\n                            children: [\n                                dark ? \"Light\" : \"Dark\",\n                                \" mode\"\n                            ]\n                        }, void 0, true, {\n                            fileName: \"/home/vishal/Development/Scrapper/frontend/src/pages/_app.jsx\",\n                            lineNumber: 24,\n                            columnNumber: 11\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/home/vishal/Development/Scrapper/frontend/src/pages/_app.jsx\",\n                    lineNumber: 14,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"/home/vishal/Development/Scrapper/frontend/src/pages/_app.jsx\",\n                lineNumber: 13,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"main\", {\n                className: \"container py-6 animate-fade-in-up\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                    ...pageProps\n                }, void 0, false, {\n                    fileName: \"/home/vishal/Development/Scrapper/frontend/src/pages/_app.jsx\",\n                    lineNumber: 30,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"/home/vishal/Development/Scrapper/frontend/src/pages/_app.jsx\",\n                lineNumber: 29,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"/home/vishal/Development/Scrapper/frontend/src/pages/_app.jsx\",\n        lineNumber: 12,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2FwcC5qc3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUErQjtBQUNGO0FBQ2U7QUFFN0IsU0FBU0csSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRTtJQUNsRCxNQUFNLENBQUNDLE1BQU1DLFFBQVEsR0FBR0wsK0NBQVFBLENBQUM7SUFDakNELGdEQUFTQSxDQUFDO1FBQ1JPLFNBQVNDLGVBQWUsQ0FBQ0MsU0FBUyxDQUFDQyxNQUFNLENBQUMsUUFBUUw7SUFDcEQsR0FBRztRQUFDQTtLQUFLO0lBRVQscUJBQ0UsOERBQUNNO1FBQUlDLFdBQVU7OzBCQUNiLDhEQUFDQztnQkFBT0QsV0FBVTswQkFDaEIsNEVBQUNEO29CQUFJQyxXQUFVOztzQ0FDYiw4REFBQ0Q7NEJBQUlDLFdBQVU7OzhDQUNiLDhEQUFDYixrREFBSUE7b0NBQUNlLE1BQUs7b0NBQUlGLFdBQVU7OENBQWdCOzs7Ozs7OENBQ3pDLDhEQUFDRztvQ0FBSUgsV0FBVTs7c0RBQ2IsOERBQUNiLGtEQUFJQTs0Q0FBQ2UsTUFBSzs0Q0FBUUYsV0FBVTtzREFBd0I7Ozs7OztzREFDckQsOERBQUNiLGtEQUFJQTs0Q0FBQ2UsTUFBSzs0Q0FBWUYsV0FBVTtzREFBd0I7Ozs7OztzREFDekQsOERBQUNiLGtEQUFJQTs0Q0FBQ2UsTUFBSzs0Q0FBWUYsV0FBVTtzREFBd0I7Ozs7OztzREFDekQsOERBQUNiLGtEQUFJQTs0Q0FBQ2UsTUFBSzs0Q0FBUUYsV0FBVTtzREFBd0I7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQ0FHekQsOERBQUNJOzRCQUFPQyxTQUFTLElBQU1YLFFBQVEsQ0FBQ1ksSUFBTSxDQUFDQTs0QkFBSU4sV0FBVTs7Z0NBQ2xEUCxPQUFPLFVBQVU7Z0NBQU87Ozs7Ozs7Ozs7Ozs7Ozs7OzswQkFJL0IsOERBQUNjO2dCQUFLUCxXQUFVOzBCQUNkLDRFQUFDVDtvQkFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7OztBQUloQyIsInNvdXJjZXMiOlsid2VicGFjazovL3NjcmFwcGVyLWZyb250ZW5kLy4vc3JjL3BhZ2VzL19hcHAuanN4PzRjNzciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuLi9zdHlsZXMvZ2xvYmFscy5jc3MnO1xuaW1wb3J0IExpbmsgZnJvbSAnbmV4dC9saW5rJztcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH0pIHtcbiAgY29uc3QgW2RhcmssIHNldERhcmtdID0gdXNlU3RhdGUoZmFsc2UpO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdkYXJrJywgZGFyayk7XG4gIH0sIFtkYXJrXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBiZy1iYWNrZ3JvdW5kIHRleHQtZm9yZWdyb3VuZCBiZy1hcHBcIj5cbiAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwiYm9yZGVyLWIvNTAgYmctY2FyZC83MCBiYWNrZHJvcC1ibHVyIHN1cHBvcnRzLVtiYWNrZHJvcC1maWx0ZXJdOmJnLWNhcmQvNjBcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXIgZmxleCBoLTE0IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC02XCI+XG4gICAgICAgICAgICA8TGluayBocmVmPVwiL1wiIGNsYXNzTmFtZT1cImZvbnQtc2VtaWJvbGRcIj5TY3JhcGVyIEFkbWluPC9MaW5rPlxuICAgICAgICAgICAgPG5hdiBjbGFzc05hbWU9XCJoaWRkZW4gc206ZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTQgdGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5cbiAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9zaG9wXCIgY2xhc3NOYW1lPVwiaG92ZXI6dGV4dC1mb3JlZ3JvdW5kXCI+U2hvcDwvTGluaz5cbiAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi93ZWJzaXRlc1wiIGNsYXNzTmFtZT1cImhvdmVyOnRleHQtZm9yZWdyb3VuZFwiPldlYnNpdGVzPC9MaW5rPlxuICAgICAgICAgICAgICA8TGluayBocmVmPVwiL3Byb2R1Y3RzXCIgY2xhc3NOYW1lPVwiaG92ZXI6dGV4dC1mb3JlZ3JvdW5kXCI+UHJvZHVjdHM8L0xpbms+XG4gICAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvbG9nc1wiIGNsYXNzTmFtZT1cImhvdmVyOnRleHQtZm9yZWdyb3VuZFwiPkxvZ3M8L0xpbms+XG4gICAgICAgICAgICA8L25hdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldERhcmsoKHYpID0+ICF2KX0gY2xhc3NOYW1lPVwidGV4dC1zbSByb3VuZGVkLW1kIGJvcmRlciBweC0zIHB5LTEuNSBob3ZlcjpiZy1hY2NlbnRcIj5cbiAgICAgICAgICAgIHtkYXJrID8gJ0xpZ2h0JyA6ICdEYXJrJ30gbW9kZVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvaGVhZGVyPlxuICAgICAgPG1haW4gY2xhc3NOYW1lPVwiY29udGFpbmVyIHB5LTYgYW5pbWF0ZS1mYWRlLWluLXVwXCI+XG4gICAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cbiAgICAgIDwvbWFpbj5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJMaW5rIiwidXNlRWZmZWN0IiwidXNlU3RhdGUiLCJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJkYXJrIiwic2V0RGFyayIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwiZGl2IiwiY2xhc3NOYW1lIiwiaGVhZGVyIiwiaHJlZiIsIm5hdiIsImJ1dHRvbiIsIm9uQ2xpY2siLCJ2IiwibWFpbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/pages/_app.jsx\n");

/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./src/pages/_app.jsx")));
module.exports = __webpack_exports__;

})();