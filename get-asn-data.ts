export const getASNIPFromGithub = async (asn: number, isIPv6 = false) => {
  console.log(
    `Fetching ${isIPv6 ? 'IPv6' : 'IPv4'} IPs for ASN ${asn} from GitHub...`,
  );
  const asnResponse = await fetch(
    `https://raw.githubusercontent.com/ipverse/as-ip-blocks/refs/heads/master/as/${asn}/ipv${isIPv6 ? '6' : '4'}-aggregated.txt`,
  );
  return (await asnResponse.text())
    .replaceAll(/#.*\n/g, '')
    .split('\n')
    .filter(Boolean);
};

export const buildRouterV7Command = async (asn: number[] | number) => {
  let command = `/ip firewall address-list`;
  if (!Array.isArray(asn)) {
    asn = [asn];
  }
  await Promise.all(
    asn.map(async (asnNumber) => {
      const v4IPs = await getASNIPFromGithub(asnNumber, false);
      const v6IPs = await getASNIPFromGithub(asnNumber, true);
      if (v4IPs.length > 0) {
        command += v4IPs
          .map((ip) => `\nadd list=ASN-${asnNumber} address=${ip}`)
          .join('');
      }
      if (v6IPs.length > 0) {
        command += v6IPs
          .map((ip) => `\nadd list=ASN-${asnNumber} address=${ip}`)
          .join('');
      }
    }),
  );
  return command;
};

export const getASNFromIPs = async (ips: string[]) => {
  console.log('Fetching ASN data for provided IPs...');
  const asnData = await Promise.all(
    ips.map(async (ip) => {
      const response = await fetch(`https://geoip.oxl.app/api/ip/${ip}`);
      const data = await response.json();
      if (!data.asn) {
        console.warn(`No ASN data found for IP ${ip}`);
        return { ip, asn: null };
      }
      return { ip, asn: data.asn };
    }),
  );
  return asnData;
};
