# ==============================================================================
# run_app.R - Launcher Aplikasi BBKA Analytics Studio (R Native Engine)
# ==============================================================================

get_content_type <- function(file_path) {
  ext <- tolower(tools::file_ext(file_path))
  
  # Next.js App Router RSC Payload files (.txt)
  if (ext == "txt" && grepl("(^|/)__next|page", basename(file_path), ignore.case = TRUE)) {
    return("text/x-component; charset=utf-8")
  }
  
  switch(ext,
    "html" = "text/html; charset=utf-8",
    "js"   = "application/javascript; charset=utf-8",
    "mjs"  = "application/javascript; charset=utf-8",
    "css"  = "text/css; charset=utf-8",
    "json" = "application/json; charset=utf-8",
    "svg"  = "image/svg+xml",
    "png"  = "image/png",
    "jpg"  = "image/jpeg",
    "jpeg" = "image/jpeg",
    "ico"  = "image/x-icon",
    "csv"  = "text/csv; charset=utf-8",
    "txt"  = "text/plain; charset=utf-8",
    "woff" = "font/woff",
    "woff2"= "font/woff2",
    "ttf"  = "font/ttf",
    {
      if (requireNamespace("mime", quietly = TRUE)) {
        mime::guess_type(file_path)
      } else {
        "application/octet-stream"
      }
    }
  )
}

#' Jalankan Aplikasi BBKA Analytics Studio
#'
#' Membuka antarmuka web interaktif BBKA Analytics Studio yang ditenagai oleh
#' R Plumber backend untuk analisis statistik berstandar publikasi jurnal.
#'
#' @param port Port web server lokal (default: 8000)
#' @param open_browser Buka browser otomatis (default: TRUE)
#' @export
#' @examples
#' \dontrun{
#'   library(bbka.analytics)
#'   run_app()
#' }
run_app <- function(port = 8000, open_browser = TRUE) {
  # 0. Set headless device & matikan inisialisasi X11/RGL display di macOS / server
  options(rgl.useNULL = TRUE)
  Sys.setenv(RGL_USE_NULL = "TRUE")

  # 1. Hentikan server sebelumnya jika masih aktif di sesi R
  try(httpuv::stopAllServers(), silent = TRUE)

  required_pkgs <- c("plumber", "httpuv", "jsonlite", "readr", "readxl", "dplyr", "lme4", "lmerTest", "lavaan", "metafor", "car", "emmeans", "effectsize", "rstatix", "heplots", "mice", "mime")
  for (pkg in required_pkgs) {
    if (!requireNamespace(pkg, quietly = TRUE)) {
      message(sprintf("Menginstall paket R yang diperlukan: %s ...", pkg))
      install.packages(pkg, repos = "https://cloud.r-project.org")
    }
  }

  # Resolusi file API & Frontend Web (Prioritaskan file resmi dari paket terpasang)
  api_path <- system.file("plumber.R", package = "bbka.analytics")
  www_path <- system.file("out", package = "bbka.analytics")

  # Fallback jika dijalankan langsung dari direktori source pengembangan lokal
  if (!file.exists(api_path) || api_path == "") {
    if (file.exists(file.path(getwd(), "inst", "plumber.R"))) {
      api_path <- file.path(getwd(), "inst", "plumber.R")
    } else if (file.exists(file.path(getwd(), "plumber.R"))) {
      api_path <- file.path(getwd(), "plumber.R")
    }
  }

  if (!dir.exists(www_path) || www_path == "") {
    if (dir.exists(file.path(getwd(), "inst", "out"))) {
      www_path <- file.path(getwd(), "inst", "out")
    } else if (dir.exists(file.path(getwd(), "out"))) {
      www_path <- file.path(getwd(), "out")
    } else {
      pkg_www2 <- system.file("www", package = "bbka.analytics")
      if (dir.exists(pkg_www2)) www_path <- pkg_www2
    }
  }

  if (!file.exists(api_path)) {
    stop("File plumber.R tidak ditemukan. Pastikan direktori kerja atau paket telah terpasang dengan benar.")
  }

  # Router API Plumber
  pr <- plumber::plumb(api_path)

  # ================================
  # HTTP Server Handler
  # ================================
  app <- list(
    call = function(req) {
      tryCatch({
        path <- req$PATH_INFO

        # 1. API ROUTE (/api/...)
        if (startsWith(path, "/api")) {
          return(pr$call(req))
        }

        # 2. ROOT ROUTE REDIRECT (Redirect / ke /data)
        if (path == "" || path == "/") {
          return(list(
            status = 302L,
            headers = list(
              "Location" = "/data",
              "Cache-Control" = "no-cache"
            ),
            body = ""
          ))
        }

        # 3. RESOLVE STATIC FILES FROM out/
        rel_path <- sub("^/", "", path)
        target_file <- file.path(www_path, rel_path)

        # A. Direct exact file match (e.g. _next/static/..., favicon.ico, file.svg)
        if (file.exists(target_file) && !dir.exists(target_file)) {
          # File ready
        }
        # B. Icon / Favicon requests (Safari Apple Touch Icon, Favicon, etc.)
        else if (grepl("(apple-touch-icon|apple-icon|favicon|icon)", rel_path, ignore.case = TRUE)) {
          for (alt in c("apple-touch-icon.png", "apple-icon.png", "icon.png", "favicon.ico", "icon.svg", "favicon.svg")) {
            alt_file <- file.path(www_path, alt)
            if (file.exists(alt_file)) {
              target_file <- alt_file
              break
            }
          }
        }
        # C. HTML route match (e.g. /data -> out/data.html, /regression -> out/regression.html)
        else if (file.exists(paste0(target_file, ".html"))) {
          target_file <- paste0(target_file, ".html")
        }
        # D. RSC TXT route match (e.g. /data.txt -> out/data.txt)
        else if (file.exists(paste0(target_file, ".txt"))) {
          target_file <- paste0(target_file, ".txt")
        }
        # E. Directory index.html match (e.g. /data/ -> out/data/index.html)
        else if (dir.exists(target_file) && file.exists(file.path(target_file, "index.html"))) {
          target_file <- file.path(target_file, "index.html")
        }
        # F. Fallback to /data.html
        else if (file.exists(file.path(www_path, "data.html"))) {
          target_file <- file.path(www_path, "data.html")
        }
        # F. Fallback to index.html
        else {
          target_file <- file.path(www_path, "index.html")
        }

        if (!file.exists(target_file) || dir.exists(target_file)) {
          return(list(
            status = 404L,
            headers = list("Content-Type" = "text/plain; charset=utf-8"),
            body = "404 - File Not Found"
          ))
        }

        finfo <- file.info(target_file)
        file_size <- if (!is.na(finfo$size)) as.integer(finfo$size) else 0L
        c_type <- get_content_type(target_file)

        body_content <- if (file_size > 0) {
          readBin(target_file, "raw", file_size)
        } else {
          raw(0)
        }

        return(list(
          status = 200L,
          headers = list(
            "Content-Type" = c_type,
            "Content-Length" = as.character(file_size),
            "Cache-Control" = "no-cache, no-store, must-revalidate, max-age=0",
            "Pragma" = "no-cache",
            "Expires" = "0"
          ),
          body = body_content
        ))
      }, error = function(err) {
        return(list(
          status = 500L,
          headers = list("Content-Type" = "text/plain; charset=utf-8"),
          body = paste("500 Internal Server Error:", err$message)
        ))
      })
    }
  )

  # ================================
  # BUKA BROWSER OTOMATIS
  # ================================
  if (open_browser) {
    if (requireNamespace("later", quietly = TRUE)) {
      later::later(function() {
        utils::browseURL(sprintf("http://localhost:%s/data", port))
      }, 1)
    } else {
      utils::browseURL(sprintf("http://localhost:%s/data", port))
    }
  }

  message("==========================================================================")
  message(sprintf("  BBKA Analytics Studio (R Native Engine) Berjalan di: http://localhost:%s/data", port))
  message("  Tekan Esc atau Ctrl+C di konsol R untuk menghentikan server.")
  message("==========================================================================")

  httpuv::runServer(
    host = "0.0.0.0",
    port = port,
    app = app
  )
}
