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

Compile to a standalone executable:

```sh
bun run build
```

## Releases

Pre-built binaries for Linux, macOS, and Windows are available on the [Releases](../../releases) page.
