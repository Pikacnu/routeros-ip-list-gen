# RouterOS IP List Generator

Generate MikroTik RouterOS firewall address lists from ASN numbers or look up ASN info from IP addresses.

## Install

Requires [Bun](https://bun.sh).

```sh
bun install
```

## Usage

Fetch IPs for an ASN and generate RouterOS commands:

```sh
bun run.ts --asn 13335
```

Multiple ASNs:

```sh
bun run.ts --asn 13335 --asn 15169
```

Look up ASN from an IP:

```sh
bun run.ts --ip 1.1.1.1
```

## Build

Compile to a standalone executable (no Bun needed to run):

```sh
bun run build
```

This produces a `ros-ip-gen` binary for your current platform, same as the ones provided in releases.

## Releases

Pre-built binaries for Linux, macOS, and Windows are available on the [Releases](../../releases) page. Just download the one for your platform and run it directly — no runtime required.

## Credits

- [ipverse/as-ip-blocks](https://github.com/ipverse/as-ip-blocks) — IP block data by ASN
- [O-X-L/geoip-asn](https://github.com/O-X-L/geoip-asn) — GeoIP ASN lookup API
