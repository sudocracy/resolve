# resolve
A tool similar to GNU/BSD [realpath][1], but works on aliases created via Finder in macOS.

Ever needed to navigate to a directory pointed to by an Finder alias?

Let's say Alice has an alias called `foo` on her Desktop that points to the directory `~/Documents/bar`. She wants to `cd foo` as if it were a symbolic link:

```
§ pwd
/Users/alice/Desktop

§ cd foo
-bash: cd: foo: Not a directory
```

Hmm..why did that not work? Let's check if it is an alias.

```
§ ls -l foo
-rw-r--r-- 1 alice staff 808 Nov 19 13:06 foo

§ xattr -l foo | grep -o 'com.apple.FinderInfo' | wc -l
1
```

It is an alias. Let's see what it points to, and go into that directory.

```
§ resolve foo
/Users/alice/Documents/bar

§ cd $(resolve foo)

§ pwd
/Users/alice/Documents/bar
```

## Installation

This assumes that the `/usr/local/bin` path exists and is in path:

```
curl 'https://raw.githubusercontent.com/sudocracy/resolve/refs/heads/main/resolve-osx-alias.osa.js' --output /usr/local/bin/resolve-osx-alias.osa.js
chmod +x  /usr/local/bin/resolve-osx-alias.osa.js
ln -s /usr/local/bin/resolve-osx-alias.osa.js resolve
```

[1]: https://man.freebsd.org/cgi/man.cgi?realpath(1)
