# andasy.hcl app configuration file generated for enjoyrwanda on Thursday, 30-Apr-26 10:39:38 SAST
#
# See https://github.com/quarksgroup/andasy-cli for information about how to use this file.

app_name = "enjoyrwanda"

app {

  env = {}

  port = 5173

  primary_region = "fsn"

  compute {
    cpu      = 1
    memory   = 256
    cpu_kind = "shared"
  }

  process {
    name = "enjoyrwanda"
  }

}
