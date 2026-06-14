import { parseArgs } from 'util';
import { buildRouterV7Command, getASNFromIPs } from './get-asn-data.ts';
import { file } from 'bun';

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    help: {
      type: 'boolean',
      short: 'h',
      description: 'Show this help message',
    },
    asn: {
      type: 'string',
      multiple: true,
      required: false,
      description: 'ASN number to fetch IPs for',
    },
    ip: {
      type: 'string',
      multiple: true,
      required: false,
      description: 'IP address to fetch ASN for',
    },
  },
  strict: true,
  allowPositionals: true,
});

if (values.help) {
  console.log(`
Usage: bun run.ts [options]
Options:
  -h, --help        Show this help message
  --asn <number>   ASN number to fetch IPs for (can be specified multiple times)
  --ip <address>   IP address to fetch ASN for (can be specified multiple times)
Examples:
  bun run.ts --asn 12345
  bun run.ts --asn 12345 --asn 67890
  bun run.ts --ip 1.1.1.1
  bun run.ts --asn 12345 --ip 8.8.8.8
  `);
  process.exit(0);
}

const ips = !!values.ip
  ? (() => {
      const ipSet = new Set<string>();
      const ipList = values.ip.filter((ip: string) => {
        // Basic validation for IPv4 and IPv6 addresses
        const ipv4Regex =
          /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
        const ipv6Regex =
          /^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:))|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|([0-9a-fA-F]{1,4}:)((:[0-9a-fA-F]{1,4}){1,6})|(:)((:[0-9a-fA-F]{1,4}){1,7}|:)$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
      });
      if (ipList.length !== values.ip.length) {
        console.error(
          'Some provided IPs are invalid. Please check your input.',
        );
        process.exit(1);
      }
      ipList.forEach((ip: string) => ipSet.add(ip));
      return Array.from(ipSet);
    })()
  : null;

const ASNs = !!values.asn
  ? (() => {
      const asnSet = new Set<number>();
      const asnNums = values.asn.map(Number).filter((num) => !isNaN(num));
      if (asnNums.length !== values.asn.length) {
        console.error(
          'Some provided ASNs are invalid. Please check your input.',
        );
        process.exit(1);
      }
      asnNums.forEach((asn: number) => asnSet.add(asn));
      return Array.from(asnSet);
    })()
  : null;

if (!ASNs && !ips) {
  console.error(
    'No ASNs or IPs provided. Use --asn or --ip options. try --help for more information.',
  );
  process.exit(1);
}

const ASNSearchFromIPs = (await getASNFromIPs(ips || [])).filter(
  (result) => result.asn !== null,
);

const asnNumbers = [
  ...(ASNs || []),
  ...ASNSearchFromIPs.map((result) => result.asn!),
].map(Number);
const command = await buildRouterV7Command(asnNumbers);
file('routeros-commands.rsc').write(command);
console.log('RouterOS commands have been written to routeros-commands.rsc');
