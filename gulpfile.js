"use strict";

const source_folder = "#src";
const project_folder = "dist";
// const project_folder = require("path").basename(__dirname);

const path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.+(png|jpg|gif|ico|svg|webp)",
    fonts: source_folder + "/fonts/**/*.ttf",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.+(png|jpg|gif|ico|svg|webp)",
  },
  clean: "./" + project_folder + "/",
};

const fs = require("fs");
const { src, dest, task, watch, series, parallel } = require("gulp");
const browsersync = require("browser-sync").create();
const fileinclude = require("gulp-file-include");
const del = require("del");
const scss = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const groupmedia = require("gulp-group-css-media-queries");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const webpHTML = require("gulp-webp-html");
const webpCSS = require("gulp-webp-css");
const svgSprite = require("gulp-svg-sprite");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const fonter = require("gulp-fonter");

function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/",
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    // .pipe(webpHTML())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded",
      }).on("error", scss.logError)
    )
    .pipe(groupmedia())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true,
      })
    )
    .pipe(webpCSS([".jpg", ".jpeg"]))
    .pipe(dest(path.build.css)) // uncompressed CSS
    .pipe(cleanCSS())
    .pipe(
      rename({
        extname: ".min.css",
      })
    )
    .pipe(dest(path.build.css)) // minify CSS
    .pipe(browsersync.stream());
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js)) // uncompressed JavaScript
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js",
      })
    )
    .pipe(dest(path.build.js)) // minify JavaScript
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(dest(path.build.img)) // copy .webp to distination
    .pipe(src(path.src.img)) // source again
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 85, progressive: true }),
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: false }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}

function fonts() {
  return src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
    .pipe(src(path.src.fonts))
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
}

function fontsStyle() {
  let file_content = fs.readFileSync(source_folder + "/scss/fonts.scss");
  if (file_content == "") {
    fs.writeFile(source_folder + "/scss/fonts.scss", "", cb);

    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname = "";
        for (let i = 0; i < items.length; i++) {
          let fontname = items[i].split(".");
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(
              source_folder + "/scss/fonts.scss",
              `@include font("${fontname}", "${fontname}", "400", "normal");\r\n`,
              cb
            );
          }
          c_fontname = fontname;
        }
      }
    });
  }
}

const cb = () => {};

function watchFiles() {
  watch([path.watch.html], html);
  watch([path.watch.css], css);
  watch([path.watch.js], js);
  watch([path.watch.img], images);
}

function clean() {
  return del(path.clean);
}

task("svgSprite", () => {
  return src([source_folder + "/iconsprite/*.svg"])
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../icons/icons.svg",
            example: false,
          },
        },
      })
    )
    .pipe(dest(path.build.img));
});

task("otf2ttf", () => {
  return src([source_folder + "/fonts/**/*.otf"])
    .pipe(
      fonter({
        formats: ["ttf"],
      })
    )
    .pipe(dest(source_folder + "/fonts/"));
});

const build = series(clean, parallel(images, fonts, js, css, html), fontsStyle);
const watching = parallel(build, watchFiles, browserSync);

// exports
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watching = watching;
exports.default = watching;
